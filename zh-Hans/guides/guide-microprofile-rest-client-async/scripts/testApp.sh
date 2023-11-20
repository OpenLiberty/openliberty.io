#!/bin/bash
set -euxo pipefail

./scripts/packageApps.sh

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -pl system verify
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -pl inventory verify
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -pl query verify

./scripts/buildImages.sh

docker pull -q "bitnami/zookeeper:3"
docker pull -q "bitnami/kafka:2"

./scripts/startContainers.sh

sleep 180

docker logs system1
docker logs system2
docker logs system3
docker logs inventory
docker logs query

systemCPULoad="$(curl --write-out "%{http_code}" --silent --output /dev/null "http://localhost:9085/inventory/systems")"

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

sleep 15

# Delete images and clear .m2 cache
docker image remove system:1.0-SNAPSHOT
docker image remove inventory:1.0-SNAPSHOT
docker image remove query:1.0-SNAPSHOT

rm -rf ~/.m2
