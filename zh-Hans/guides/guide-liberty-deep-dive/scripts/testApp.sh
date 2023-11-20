#!/bin/bash
set -euxo pipefail


echo ===== Test module-getting-started =====
cd module-getting-started || exit

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy

mvn -ntp liberty:start
curl -s http://localhost:9080/inventory/api/systems | grep "\\[\\]" || exit 1

curl -s http://localhost:9080/inventory/api/systems | grep "\\[\\]" || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X POST "http://localhost:9080/inventory/api/systems?hostname=localhost&osName=mac&javaVersion=11&heapSize=1")"
echo status="$status"
if [ "$status" -ne 200 ] ; then exit $?; fi

curl -s http://localhost:9080/inventory/api/systems | grep localhost || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X POST "http://localhost:9080/inventory/api/systems?hostname=localhost&osName=mac&javaVersion=11&heapSize=1")"
echo status="$status"
if [ "$status" -ne 400 ] ; then exit $?; fi

curl -s http://localhost:9080/inventory/api/systems/localhost | grep localhost || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X PUT "http://localhost:9080/inventory/api/systems/localhost?osName=mac&javaVersion=17&heapSize=2")"
echo status="$status"
if [ "$status" -ne 200 ] ; then exit $?; fi

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X PUT "http://localhost:9080/inventory/api/systems/unknown?osName=mac&javaVersion=17&heapSize=2")"
echo status="$status"
if [ "$status" -ne 400 ] ; then exit $?; fi

curl -X DELETE http://localhost:9080/inventory/api/systems/unknown | grep "does not exists" || exit 1

curl -X DELETE http://localhost:9080/inventory/api/systems/localhost | grep removed || exit 1

curl -X POST http://localhost:9080/inventory/api/systems/client/localhost | grep "not implemented" || exit 1

mvn -ntp liberty:stop

echo ===== Test module-openapi =====
cd ../module-openapi || exit
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy

mvn -ntp liberty:start

curl -s http://localhost:9080/inventory/api/systems | grep "\\[\\]" || exit 1

curl -s http://localhost:9080/inventory/api/systems | grep "\\[\\]" || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X POST "http://localhost:9080/inventory/api/systems?hostname=localhost&osName=mac&javaVersion=11&heapSize=1")"
echo status="$status"
if [ "$status" -ne 200 ] ; then exit $?; fi

curl -s http://localhost:9080/inventory/api/systems | grep localhost || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X POST "http://localhost:9080/inventory/api/systems?hostname=localhost&osName=mac&javaVersion=11&heapSize=1")"
echo status="$status"
if [ "$status" -ne 400 ] ; then exit $?; fi

curl -s http://localhost:9080/inventory/api/systems/localhost | grep localhost || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X PUT "http://localhost:9080/inventory/api/systems/localhost?osName=mac&javaVersion=17&heapSize=2")"
echo status="$status"
if [ "$status" -ne 200 ] ; then exit $?; fi

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X PUT "http://localhost:9080/inventory/api/systems/unknown?osName=mac&javaVersion=17&heapSize=2")"
echo status="$status"
if [ "$status" -ne 400 ] ; then exit $?; fi

curl -X DELETE http://localhost:9080/inventory/api/systems/unknown | grep "does not exists" || exit 1

curl -X DELETE http://localhost:9080/inventory/api/systems/localhost | grep removed || exit 1

curl -X POST http://localhost:9080/inventory/api/systems/client/localhost | grep "not implemented" || exit 1

mvn -ntp liberty:stop

echo ===== Test module-config =====
cd ../module-config || exit
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy

mvn -ntp liberty:start

curl -s http://localhost:9080/inventory/api/systems | grep "\\[\\]" || exit 1

curl -s http://localhost:9080/inventory/api/systems | grep "\\[\\]" || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X POST "http://localhost:9080/inventory/api/systems?hostname=localhost&osName=mac&javaVersion=11&heapSize=1")"
echo status="$status"
if [ "$status" -ne 200 ] ; then exit $?; fi

curl -s http://localhost:9080/inventory/api/systems | grep localhost || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X POST "http://localhost:9080/inventory/api/systems?hostname=localhost&osName=mac&javaVersion=11&heapSize=1")"
echo status="$status"
if [ "$status" -ne 400 ] ; then exit $?; fi

curl -s http://localhost:9080/inventory/api/systems/localhost | grep localhost || exit 1

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X PUT "http://localhost:9080/inventory/api/systems/localhost?osName=mac&javaVersion=17&heapSize=2")"
echo status="$status"
if [ "$status" -ne 200 ] ; then exit $?; fi

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null -X PUT "http://localhost:9080/inventory/api/systems/unknown?osName=mac&javaVersion=17&heapSize=2")"
echo status="$status"
if [ "$status" -ne 400 ] ; then exit $?; fi

curl -X DELETE http://localhost:9080/inventory/api/systems/unknown | grep "does not exists" || exit 1

curl -X DELETE http://localhost:9080/inventory/api/systems/localhost | grep removed || exit 1

curl -X POST http://localhost:9080/inventory/api/systems/client/localhost | grep "5555" || exit 1

mvn -ntp liberty:stop

echo ===== Test module-jwt =====

cd ../postgres || exit
docker build -t postgres-sample .
docker run --name postgres-container -p 5432:5432 -d postgres-sample

cd ../system || exit
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy
mvn -ntp liberty:start

cd ../module-jwt || exit

if [[ -e ./src/main/java/io/openliberty/deepdive/rest/health ]]; then
    rm -fr ./src/main/java/io/openliberty/deepdive/rest/health
fi

cp -f ../system/src/main/liberty/config/resources/security/key.p12 ./src/main/liberty/config/resources/security/key.p12
mkdir -p ./src/main/java/io/openliberty/deepdive/rest/health
cp ../module-health-checks/src/main/java/io/openliberty/deepdive/rest/health/StartupCheck.java ./src/main/java/io/openliberty/deepdive/rest/health
cp ../module-health-checks/src/main/java/io/openliberty/deepdive/rest/health/LivenessCheck.java ./src/main/java/io/openliberty/deepdive/rest/health
cp ../module-health-checks/src/main/java/io/openliberty/deepdive/rest/health/ReadinessCheck.java ./src/main/java/io/openliberty/deepdive/rest/health
cp ../module-metrics/src/main/liberty/config/server.xml ./src/main/liberty/config/server.xml
cp ../module-metrics/src/main/java/io/openliberty/deepdive/rest/SystemResource.java ./src/main/java/io/openliberty/deepdive/rest/SystemResource.java

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy

mvn -ntp liberty:start

sleep 20

echo ===== Test module-health-checks =====

cd ../module-jwt || exit

curl http://localhost:9080/health/started | grep "\"status\":" || exit 1
curl http://localhost:9080/health/live | grep "\"status\":" || exit 1
curl http://localhost:9080/health/ready | grep "\"status\":\"UP\"" || exit 1


echo ===== Test client REST API =====

curl -k --user bob:bobpwd -X POST 'https://localhost:9443/inventory/api/systems/client/localhost' | grep "was added" || exit 1

curl 'http://localhost:9080/inventory/api/systems' | grep "\"heapSize\":" || exit 1


echo ===== Test module-metrics =====

curl -k --user bob:bobpwd -X DELETE https://localhost:9443/inventory/api/systems/localhost
curl -X POST "http://localhost:9080/inventory/api/systems?heapSize=1048576&hostname=localhost&javaVersion=9&osName=linux"
curl -k --user alice:alicepwd -X PUT "http://localhost:9080/inventory/api/systems/localhost?heapSize=2097152&javaVersion=11&osName=linux"
curl -s http://localhost:9080/inventory/api/systems

curl -k --user bob:bobpwd https://localhost:9443/metrics\?scope=application | grep 'addSystemClient_total{mp_scope="application",} 0\|addSystem_total{mp_scope="application",} 1\|updateSystem_total{mp_scope="application",} 1\|removeSystem_total{mp_scope="application",} 1' || exit 1


echo ===== Stop all processes

mvn -ntp liberty:stop 

cd ../system
mvn -ntp liberty:stop

docker stop postgres-container
docker rm postgres-container


echo ===== Test module-testcontainers =====

cd ../module-jwt

cp ../module-kubernetes/src/main/liberty/config/server.xml ./src/main/liberty/config/server.xml
cp ../module-kubernetes/Dockerfile .
docker pull -q icr.io/appcafe/open-liberty:full-java11-openj9-ubi 

mvn -ntp package
docker build -t liberty-deepdive-inventory:1.0-SNAPSHOT .
docker images
docker ps 

if [[ -e ./src/test ]]; then
    rm -fr ./src/test
fi
if [[ -e ./src/test/resources ]]; then
    rm -fr ./src/test/resources
fi

mkdir -p src/test/java/it/io/openliberty/deepdive/rest
mkdir src/test/resources

cp ../module-testcontainers/src/test/java/it/io/openliberty/deepdive/rest/SystemResourceClient.java ./src/test/java/it/io/openliberty/deepdive/rest
cp ../module-testcontainers/src/test/java/it/io/openliberty/deepdive/rest/SystemData.java ./src/test/java/it/io/openliberty/deepdive/rest
cp ../module-testcontainers/src/test/java/it/io/openliberty/deepdive/rest/LibertyContainer.java ./src/test/java/it/io/openliberty/deepdive/rest
cp ../module-testcontainers/src/test/java/it/io/openliberty/deepdive/rest/SystemResourceIT.java ./src/test/java/it/io/openliberty/deepdive/rest
cp ../module-testcontainers/src/test/resources/log4j.properties ./src/test/resources
cp ../module-testcontainers/pom.xml .

mvn -ntp verify -Dtest.protocol=http

echo ===== Test module-kubernetes =====

cp ../module-kubernetes/inventory.init.yaml .
cp ../module-kubernetes/inventory.yaml .

#./../scripts/startMinikube.sh
minikube start
minikube status
#kubectl cluster-info
#kubectl get services --all-namespaces
#kubectl config view
eval "$(minikube docker-env)"

mvn package
docker build -t liberty-deepdive-inventory:1.0-SNAPSHOT .
docker images
docker ps 

kubectl apply -f https://raw.githubusercontent.com/OpenLiberty/open-liberty-operator/main/deploy/releases/0.8.0/kubectl/openliberty-app-crd.yaml
OPERATOR_NAMESPACE=default
WATCH_NAMESPACE='""'

curl -L https://raw.githubusercontent.com/OpenLiberty/open-liberty-operator/main/deploy/releases/0.8.0/kubectl/openliberty-app-rbac-watch-all.yaml | sed -e "s/OPEN_LIBERTY_OPERATOR_NAMESPACE/${OPERATOR_NAMESPACE}/" | kubectl apply -f -
curl -L https://raw.githubusercontent.com/OpenLiberty/open-liberty-operator/main/deploy/releases/0.8.0/kubectl/openliberty-app-operator.yaml | sed -e "s/OPEN_LIBERTY_WATCH_NAMESPACE/${WATCH_NAMESPACE}/" | kubectl apply -n ${OPERATOR_NAMESPACE} -f -
kubectl api-resources --api-group=apps.openliberty.io

kubectl create secret generic post-app-credentials --from-literal username=admin --from-literal password=adminpwd

kubectl apply -f inventory.yaml

kubectl apply -f ../postgres/postgres.yaml

kubectl create configmap inv-app-root --from-literal contextRoot=/dev

sleep 120

kubectl get pods
kubectl describe pods

pkill -f "port-forward" && exit 0

sleep 30

minikube kubectl port-forward svc/inventory-deployment 9443 &

sleep 120

curl -q -k "https://localhost:9443/dev/api/systems"
curl -q -k -X POST "https://localhost:9443/dev/api/systems?heapSize=1048576&hostname=localhost&javaVersion=9&osName=linux" | grep "added" || exit 1
curl -q -k "https://localhost:9443/dev/api/systems" | grep "localhost" || exit 1

pkill -f "port-forward" && exit 0

kubectl delete -f inventory.yaml
kubectl delete -f ../postgres/postgres.yaml
kubectl delete configmap inv-app-root
kubectl delete secret post-app-credentials

OPERATOR_NAMESPACE=default
WATCH_NAMESPACE='""'

curl -L https://raw.githubusercontent.com/OpenLiberty/open-liberty-operator/main/deploy/releases/0.8.0/kubectl/openliberty-app-operator.yaml | sed -e "s/OPEN_LIBERTY_WATCH_NAMESPACE/${WATCH_NAMESPACE}/" | kubectl delete -n ${OPERATOR_NAMESPACE} -f -

curl -L https://raw.githubusercontent.com/OpenLiberty/open-liberty-operator/main/deploy/releases/0.8.0/kubectl/openliberty-app-rbac-watch-all.yaml | sed -e "s/OPEN_LIBERTY_OPERATOR_NAMESPACE/${OPERATOR_NAMESPACE}/" | kubectl delete -f -

kubectl delete -f https://raw.githubusercontent.com/OpenLiberty/open-liberty-operator/main/deploy/releases/0.8.0/kubectl/openliberty-app-crd.yaml

#../../scripts/stopMinikube.sh
eval "$(minikube docker-env -u)"
minikube stop

echo ===== TESTS PASSED =====
exit 0
