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

docker build --no-cache -t system:1.0-SNAPSHOT system/.
docker build --no-cache -t inventory:1.0-SNAPSHOT inventory/.

docker images

sed -i 's|us.icr.io/\[your-namespace\]/||g' kubernetes.yaml

cat kubernetes.yaml

kubectl apply -f kubernetes.yaml

sleep 120

kubectl get pods

GUIDE_IP=$(minikube ip)
GUIDE_SYSTEM_PORT=$(kubectl get service system-service -o jsonpath="{.spec.ports[0].nodePort}")
GUIDE_INVENTORY_PORT=$(kubectl get service inventory-service -o jsonpath="{.spec.ports[0].nodePort}")

curl http://"$GUIDE_IP":"$GUIDE_SYSTEM_PORT"/system/properties
curl http://"$GUIDE_IP":"$GUIDE_INVENTORY_PORT"/inventory/systems/system-service

mvn -ntp failsafe:integration-test -Dcluster.ip="$GUIDE_IP" -Dsystem.node.port="$GUIDE_SYSTEM_PORT" -Dinventory.node.port="$GUIDE_INVENTORY_PORT"
mvn -ntp failsafe:verify

kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep system)"
kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep inventory)"

kubectl delete -f kubernetes.yaml

#../scripts/stopMinikube.sh
minikube stop
eval "$(minikube docker-env -u)"

# Clear .m2 cache
rm -rf ~/.m2
