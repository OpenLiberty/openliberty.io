#!/bin/bash

# install Minikube prereqs for none driver

# install conntrack
apt-get update -y
apt-get install -y conntrack
sysctl fs.protected_regular=0

# install and set up cri-dockerd
VER=$(curl -s https://api.github.com/repos/Mirantis/cri-dockerd/releases/latest|grep tag_name | cut -d '"' -f 4|sed 's/v//g')
echo "$VER"
wget "https://github.com/Mirantis/cri-dockerd/releases/download/v${VER}/cri-dockerd-${VER}.amd64.tgz"
tar xvf "cri-dockerd-${VER}.amd64.tgz"
mv cri-dockerd/cri-dockerd /usr/local/bin/
cri-dockerd --version
wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.service
wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.socket
mv cri-docker.socket cri-docker.service /etc/systemd/system/
sed -i -e 's,/usr/bin/cri-dockerd,/usr/local/bin/cri-dockerd,' /etc/systemd/system/cri-docker.service
systemctl daemon-reload
systemctl enable cri-docker.service
systemctl enable --now cri-docker.socket

# install crictl
VERSION="v1.24.2"
wget "https://github.com/kubernetes-sigs/cri-tools/releases/download/$VERSION/crictl-$VERSION-linux-amd64.tar.gz"
tar zxvf "crictl-$VERSION-linux-amd64.tar.gz" -C /usr/local/bin
rm -f "crictl-$VERSION-linux-amd64.tar.gz"

# recreate minikube cluser
minikube stop
minikube delete

# start minikube with none driver
minikube start --driver=none
