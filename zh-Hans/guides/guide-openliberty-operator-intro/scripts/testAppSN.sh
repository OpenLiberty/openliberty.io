#!/bin/bash
set -euxo pipefail

mvn clean package

kubectl api-resources --api-group=apps.openliberty.io | grep "apps.openliberty.io"

docker pull icr.io/appcafe/open-liberty:full-java11-openj9-ubi
docker build -t system:1.0-SNAPSHOT system/.


docker tag system:1.0-SNAPSHOT us.icr.io/"${SN_ICR_NAMESPACE}"/system:1.0-SNAPSHOT
docker push us.icr.io/"${SN_ICR_NAMESPACE}"/system:1.0-SNAPSHOT

sed -i 's=system:1.0-SNAPSHOT=us.icr.io/'"${SN_ICR_NAMESPACE}"'/system:1.0-SNAPSHOT\n  pullPolicy: Always\n  pullSecret: icr=g' deploy.yaml
kubectl apply -f deploy.yaml

sleep 120

kubectl get OpenLibertyApplications | grep 'us.icr.io/'"${SN_ICR_NAMESPACE}"'/system:1.0-SNAPSHOT' 
kubectl describe olapps/system | grep "apps.openliberty.io/v1beta2" 
kubectl describe pods
kubectl port-forward svc/system 9080 &

sleep 120

curl -s http://localhost:9080/system/properties | grep "\"os.name\":\"Linux\"" || exit 1

pkill -f "port-forward"
kubectl delete -f deploy.yaml

echo "Tests passed"
