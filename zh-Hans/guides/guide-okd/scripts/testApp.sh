#!/bin/bash
set -euxo pipefail

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package

docker pull -q openliberty/open-liberty:kernel-java8-openj9-ubi

docker build -t system:1.0-SNAPSHOT system/.
docker build -t inventory:1.0-SNAPSHOT inventory/.

NETWORK=okd-app

docker network create $NETWORK

docker run -d --name system -p 9080:9080 --network=$NETWORK system:1.0-SNAPSHOT 
docker run -d --name inventory -p 9081:9080 --network=$NETWORK inventory:1.0-SNAPSHOT

sleep 30

systemStatus="$(curl --write-out "%{http_code}\n" --silent --output /dev/null "http://localhost:9080/system/properties")"
inventoryStatus="$(curl --write-out "%{http_code}\n" --silent --output /dev/null "http://localhost:9081/inventory/systems")"
if [ "$systemStatus" == "200" ] && [ "$inventoryStatus" == "200" ]
then 
  echo ENDPOINT OK
else 
  echo system status:
  echo "$systemStatus"
  echo inventory status:
  echo "$inventoryStatus"
  echo ENDPOINT NOT OK
  exit 1
fi

mvn -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -ntp -pl system failsafe:integration-test
mvn -Ddockerfile.skip=true \
    -Dsystem.ip=localhost:9080 \
    -Dinventory.ip=localhost:9081 \
    -Dsystem.kube.service=system \
    -ntp -pl inventory failsafe:integration-test

mvn -ntp failsafe:verify

docker stop system inventory 
docker rm system inventory 
docker network rm $NETWORK