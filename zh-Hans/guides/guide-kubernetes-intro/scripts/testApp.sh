#!/bin/bash
set -euxo pipefail

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
    -q clean package

docker pull -q icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

docker build -t system:1.0-SNAPSHOT system/.
docker build -t inventory:1.0-SNAPSHOT inventory/.

docker images

kubectl apply -f kubernetes.yaml

sleep 120

kubectl get pods

minikube ip

curl http://"$(minikube ip)":31000/system/properties
curl http://"$(minikube ip)":32000/inventory/systems

mvn -ntp failsafe:integration-test -Ddockerfile.skip=true -Dsystem.service.root="$(minikube ip):31000" -Dinventory.service.root="$(minikube ip):32000"
mvn -ntp failsafe:verify

kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep system)"
kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep inventory)"

#../scripts/stopMinikube.sh
eval "$(minikube docker-env -u)"
minikube stop
