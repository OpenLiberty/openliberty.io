#!/bin/bash
set -euxo pipefail

##############################################################################
##
##  GH actions CI test script
##
##############################################################################

# Set up
#../scripts/startMinikube.sh
minikube start
minikube status
#kubectl cluster-info
#kubectl get services --all-namespaces
#kubectl config view
eval "$(minikube docker-env)"

../scripts/installIstio.sh

# Test app

kubectl get nodes

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q package

docker pull -q icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

docker build -t system:1.0-SNAPSHOT system/.
docker build -t inventory:1.0-SNAPSHOT inventory/.

sleep 10

kubectl apply -f services.yaml
kubectl apply -f traffic.yaml

sleep 180

kubectl get pods

kubectl get deployments

kubectl get all -n istio-system

SYSTEM=$(kubectl get pods | grep system | sed 's/ .*//')

kubectl exec -it "$SYSTEM" -- /opt/ol/wlp/bin/server pause

sleep 60

export INGRESS_PORT
INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].nodePort}')

echo "$(minikube ip)":"$INGRESS_PORT"

if ! curl -H Host:inventory.example.com http://"$(minikube ip)":"$INGRESS_PORT"/inventory/systems/system-service -I; then
    exit 1
fi

sleep 30

COUNT=$(kubectl logs "$SYSTEM" -c istio-proxy | grep -c system-service:9080)

echo COUNT="$COUNT"

kubectl exec "$SYSTEM" -- cat /logs/messages.log | grep product
kubectl exec "$SYSTEM" -- cat /logs/messages.log | grep java

if [ "$COUNT" -lt 3 ]; then
    exit 1
fi

# Teardown

#../scripts/stopMinikube.sh
eval "$(minikube docker-env -u)"
minikube stop
