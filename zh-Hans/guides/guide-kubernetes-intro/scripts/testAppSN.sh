#!/bin/bash
set -euxo pipefail

mvn -q package

docker pull icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

docker build -t system:1.0-SNAPSHOT system/.
docker build -t inventory:1.0-SNAPSHOT inventory/.

echo "${SN_ICR_NAMESPACE}"
docker tag inventory:1.0-SNAPSHOT us.icr.io/"${SN_ICR_NAMESPACE}"/inventory:1.0-SNAPSHOT
docker tag system:1.0-SNAPSHOT us.icr.io/"${SN_ICR_NAMESPACE}"/system:1.0-SNAPSHOT
docker push us.icr.io/"${SN_ICR_NAMESPACE}"/inventory:1.0-SNAPSHOT
docker push us.icr.io/"${SN_ICR_NAMESPACE}"/system:1.0-SNAPSHOT

sed -i 's=system:1.0-SNAPSHOT=us.icr.io/'"${SN_ICR_NAMESPACE}"'/system:1.0-SNAPSHOT=g' kubernetes.yaml
sed -i 's=inventory:1.0-SNAPSHOT=us.icr.io/'"${SN_ICR_NAMESPACE}"'/inventory:1.0-SNAPSHOT=g' kubernetes.yaml
sed -i 's=nodePort: 31000==g' kubernetes.yaml
sed -i 's=nodePort: 32000==g' kubernetes.yaml

kubectl apply -f kubernetes.yaml

sleep 60

kubectl get pods

kubectl proxy &

SYSTEM_PROXY=localhost:8001/api/v1/namespaces/"${SN_ICR_NAMESPACE}"/services/system-service/proxy
INVENTORY_PROXY=localhost:8001/api/v1/namespaces/"${SN_ICR_NAMESPACE}"/services/inventory-service/proxy

echo "$SYSTEM_PROXY" && echo "$INVENTORY_PROXY"

sed -i 's=localhost:31000='"$SYSTEM_PROXY"'=g' inventory/pom.xml
sed -i 's=localhost:32000='"$INVENTORY_PROXY"'=g' inventory/pom.xml
sed -i 's=localhost:31000='"$SYSTEM_PROXY"'=g' system/pom.xml

mvn failsafe:integration-test 
mvn failsafe:verify

curl http://"${SYSTEM_PROXY}"/system/properties
curl http://"${INVENTORY_PROXY}"/inventory/systems

kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep system)"
kubectl logs "$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}' | grep inventory)"

kill "$(pidof kubectl)"

kubectl delete -f kubernetes.yaml
