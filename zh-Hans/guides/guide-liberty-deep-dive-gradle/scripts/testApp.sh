#!/bin/bash
set -euxo pipefail

echo ===== Test module-getting-started =====

cd ..
./scripts/finishGettingStarted.sh
cd start/inventory

./gradlew clean war libertyCreate installFeature deploy
./gradlew libertyStart
sleep 5

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

./gradlew libertyStop
sleep 15
killall java

cd ../..

echo ===== Test module-openapi =====

./scripts/finishOpenAPI.sh
cd start/inventory

./gradlew clean war libertyCreate installFeature deploy
./gradlew libertyStart
sleep 5

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

./gradlew libertyStop
sleep 15
killall java

cd ../..

echo ===== Test module-config =====

./scripts/finishConfig.sh
cd start/inventory

./gradlew clean war libertyCreate installFeature deploy
./gradlew libertyStart
sleep 10

curl -s http://localhost:9080/inventory/api/systems

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

./gradlew libertyStop
sleep 15
killall java

cd ../..

echo ===== Start system =====
cd ./finish/system || exit
./gradlew clean war libertyCreate installFeature deploy
./gradlew libertyStart
#sudo cat ./build/wlp/usr/servers/defaultServer/logs/messages.log || cat ./build/liberty-alt-output-dir/defaultServer/logs/messages.log || echo no logs
cd ../..

echo ===== Test module-persistind-data, jwt, health, metrics =====

./scripts/startPostgres.sh

cp -fr ./finish/module-jwt/* ./start/inventory
mkdir -p ./start/inventory/src/main/liberty/config/resources/security
cp ./finish/system/src/main/liberty/config/resources/security/key.p12 ./start/inventory/src/main/liberty/config/resources/security/key.p12
mkdir ./start/inventory/src/main/java/io/openliberty/deepdive/rest/health
cp ./finish/module-health-checks/src/main/java/io/openliberty/deepdive/rest/health/*.java ./start/inventory/src/main/java/io/openliberty/deepdive/rest/health

cd start/inventory

./gradlew clean war libertyCreate installFeature deploy
./gradlew libertyStart
sleep 20


echo ===== Test health checks =====

curl http://localhost:9080/health/started | grep "\"status\":" || exit 1
curl http://localhost:9080/health/live | grep "\"status\":" || exit 1
curl http://localhost:9080/health/ready | grep "\"status\":\"UP\"" || exit 1


echo ===== Test client REST API =====

curl -s http://localhost:9080/inventory/api/systems

#curl -k --user bob:bobpwd -X POST 'https://localhost:9443/inventory/api/systems/client/localhost' | grep "was added" || exit 1
curl -k --user bob:bobpwd -X POST 'https://localhost:9443/inventory/api/systems/client/localhost'
#sudo cat ./build/wlp/usr/servers/defaultServer/logs/messages.log || cat ./build/liberty-alt-output-dir/defaultServer/logs/messages.log || echo no logs
#curl 'http://localhost:9080/inventory/api/systems' | grep "\"heapSize\":" || exit 1
curl 'http://localhost:9080/inventory/api/systems'

./gradlew libertyStop
sleep 15
killall java

cd ../..

echo ===== Test module-metrics =====

cp ./finish/module-metrics/src/main/liberty/config/server.xml ./start/inventory/src/main/liberty/config
cp ./finish/module-metrics/src/main/java/io/openliberty/deepdive/rest/SystemResource.java ./start/inventory/src/main/java/io/openliberty/deepdive/rest

cd start/inventory
./gradlew war deploy
./gradlew libertyStart
sleep 15

curl -k --user bob:bobpwd -X DELETE https://localhost:9443/inventory/api/systems/localhost
curl -X POST "http://localhost:9080/inventory/api/systems?heapSize=1048576&hostname=localhost&javaVersion=9&osName=linux"
curl -k --user alice:alicepwd -X PUT "http://localhost:9080/inventory/api/systems/localhost?heapSize=2097152&javaVersion=11&osName=linux"
curl -s http://localhost:9080/inventory/api/systems

curl -k --user bob:bobpwd https://localhost:9443/metrics\?scope=application | grep 'addSystemClient_total{mp_scope="application",} 0\|addSystem_total{mp_scope="application",} 1\|updateSystem_total{mp_scope="application",} 1\|removeSystem_total{mp_scope="application",} 1' || exit 1

echo ===== Stop all processes

./gradlew libertyStop
sleep 10
killall java

cd ../..

echo ===== Test module-containerize =====

./scripts/finishContainer.sh
cd start/inventory

podman images
postgres_hostname="$(podman inspect -f "{{.NetworkSettings.IPAddress}}" postgres-container)"
podman run -d --name inventory -p 9080:9080 -e POSTGRES_HOSTNAME="$postgres_hostname" liberty-deepdive-inventory:1.0-SNAPSHOT
podman ps 
sleep 30

curl http://localhost:9080/health/started | grep "\"status\":" || exit 1
curl http://localhost:9080/health/live | grep "\"status\":" || exit 1
curl http://localhost:9080/health/ready | grep "\"status\":\"UP\"" || exit 1

podman stop inventory
podman rm inventory

cd ../..
./scripts/stopPostgres.sh

echo ===== TESTS PASSED =====
exit 0
