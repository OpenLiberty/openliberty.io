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

./scripts/buildImages.sh
./scripts/startContainers.sh

sleep 180

docker logs system

docker logs inventory

systemCPULoad="$(curl --write-out "%{http_code}" --silent --output /dev/null "http://localhost:9085/inventory/systems")"

if [ "$systemCPULoad" == "200" ]
then
  echo SystemInventory OK

  inventoryStatus="$(docker exec  inventory curl --write-out "%{http_code}" --silent --output /dev/null "http://localhost:9085/inventory/systems")"
  systemStatus="$(docker exec  system curl --write-out "%{http_code}" --silent --output /dev/null "http://system:9083/health/ready")"

  if [ "$inventoryStatus" == "200" ] && [ "$systemStatus" == "200" ]
  then
    echo ENDPOINT OK
  else
    echo inventory status:
    echo "$inventoryStatus"
    echo system status:
    echo "$systemStatus"
    echo ENDPOINT
    exit 1
  fi
else
  echo System Inventory status:
  echo "$systemCPULoad"
  echo ENDPOINT
  exit 1
fi

./scripts/stopContainers.sh
