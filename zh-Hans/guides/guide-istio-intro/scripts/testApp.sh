#!/bin/bash
set -euxo pipefail

# Set up
#../scripts/startMinikube.sh
minikube start
minikube status
#kubectl cluster-info
#kubectl get services --all-namespaces
#kubectl config view
eval "$(minikube docker-env)"

../scripts/installIstio.sh

# Deploy

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package

docker pull -q icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi
docker build -t system:2.0-SNAPSHOT .

kubectl apply -f system.yaml
kubectl apply -f traffic.yaml

kubectl set image deployment/system-deployment-blue system-container=system:2.0-SNAPSHOT
kubectl set image deployment/system-deployment-green system-container=system:2.0-SNAPSHOT

sleep 120

kubectl get deployments
kubectl get pods

export INGRESS_PORT
INGRESS_PORT="$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].nodePort}')"
echo "$(minikube ip)":"$INGRESS_PORT"
curl -H "Host:example.com" -I http://"$(minikube ip)":"$INGRESS_PORT"/system/properties

# Run tests
mvn -ntp test-compile
mvn -ntp failsafe:integration-test -Ddockerfile.skip=true -Dcluster.ip="$(minikube ip)" -Dport="$INGRESS_PORT"
mvn -ntp failsafe:verify

# Print logs
PODS=$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{","}')
IFS=',' read -r -a POD_NAMES <<< "$PODS"
for pod in "${POD_NAMES[@]}"; do
    if grep -q system <<< "$pod"; then
       kubectl logs "$pod" --all-containers=true
    fi
done

# Tear down
#../scripts/stopMinikube.sh
eval "$(minikube docker-env -u)"
minikube stop
