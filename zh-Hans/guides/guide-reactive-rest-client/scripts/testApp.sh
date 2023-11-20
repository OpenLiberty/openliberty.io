#!/bin/bash
set -euxo pipefail

mvn -ntp -pl models clean install
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package

mvn -ntp -pl system verify
mvn -ntp -pl inventory verify
mvn -ntp -pl query verify

./scripts/buildImages.sh
./scripts/startContainers.sh

sleep 180

docker logs inventory
docker logs query

systemCPULoad="$(curl --write-out "%{http_code}" --silent --output /dev/null "http://localhost:9080/query/systemLoad")"

if [ "$systemCPULoad" == "200" ]
then
  echo SystemInventory OK
else
  echo System Inventory status:
  echo "$systemCPULoad"
  echo ENDPOINT
  exit 1
fi

./scripts/stopContainers.sh
