#!/bin/bash
set -euxo pipefail

##############################################################################
##
##  GH actions CI test script
##
##############################################################################

# Test app

#../scripts/startMinikube.sh
minikube start
minikube status
#kubectl cluster-info
#kubectl get services --all-namespaces
#kubectl config view
eval "$(minikube docker-env)"

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q package

docker pull -q icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

docker build -t system:1.0-SNAPSHOT system/.
docker build -t inventory:1.0-SNAPSHOT inventory/.

docker images

kubectl apply -f kubernetes.yaml

sleep 540

kubectl get pods

minikube ip

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -Ddockerfile.skip=true \
    -Dsystem.service.root="$(minikube ip):31000" -Dinventory.service.root="$(minikube ip):32000" \
    failsafe:integration-test
mvn -ntp failsafe:verify

kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep system | head -1)"

kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep system | tail -1)"

kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep inventory)"

# sudo ../scripts/stopMinikube.sh
eval "$(minikube docker-env -u)"
minikube stop
