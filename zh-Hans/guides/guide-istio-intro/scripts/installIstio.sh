#!/bin/bash
ISTIO_LATEST=1.11.2

apt install socat

curl -L https://github.com/istio/istio/releases/download/$ISTIO_LATEST/istio-$ISTIO_LATEST-linux-amd64.tar.gz | tar xzf -

cd istio-$ISTIO_LATEST || exit 1

chmod +x bin/istioctl

export PATH=$PWD/bin:$PATH

istioctl install --set profile=demo -y

echo "Installed Istio $(istioctl version)"

sleep 240

kubectl get deployments -n istio-system

kubectl label --overwrite=true namespace default istio-injection=enabled

cd ..
