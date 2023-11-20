#!/bin/bash
set -euxo pipefail

mvn -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean install

docker build -t ol-runtime .

docker run -d --name rest-app \
  -p 9080:9080 -p 9443:9443 \
  -v "$(pwd)"/target/liberty/wlp/usr/servers:/servers \
  -u "$(id -u)" ol-runtime

sleep 60

docker logs rest-app

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null "http://localhost:9080/system/properties-new")"

if [ "$status" == "200" ]
then
  echo ENDPOINT OK
else
  echo "$status"
  echo ENDPOINT NOT OK
  exit 1
fi

docker stop rest-app

docker rm rest-app
