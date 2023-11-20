# Set up Openshift

sudo mount --make-rshared /
wget -nv https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz
tar -xvf openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz
cd openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit
export PATH=`pwd`:$PATH
cd ..
sudo mv ../scripts/daemon.json /etc/docker/
sudo systemctl restart docker
oc cluster up
