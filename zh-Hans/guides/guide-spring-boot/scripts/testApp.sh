#!/bin/bash
set -euxo pipefail

##############################################################################
##
##  GH actions CI test script
##
##############################################################################

./mvnw -ntp -Dhttp.keepAlive=false \
      -Dmaven.wagon.http.pool=false \
      -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
      -q clean package

docker pull -q icr.io/appcafe/open-liberty:kernel-slim-java8-openj9-ubi

docker build -t springboot .
docker run -d --name springBootContainer -p 9080:9080 -p 9443:9443 springboot

sleep 60

status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null "http://localhost:9080/hello")"
if [ "$status" == "200" ]; then
  echo ENDPOINT OK
else
  echo "$status"
  echo ENDPOINT NOT OK
  exit 1
fi

docker exec springBootContainer cat /logs/messages.log | grep product
docker exec springBootContainer cat /logs/messages.log | grep java

docker stop springBootContainer
docker rm springBootContainer

./mvnw -ntp liberty:start
curl http://localhost:9080/hello
./mvnw -ntp liberty:stop

if [ ! -f "target/GSSpringBootApp.jar" ]; then
  echo "target/GSSpringBootApp.jar was not generated!"
  exit 1
fi

java -jar target/GSSpringBootApp.jar &
GSSBA_PID=$!
echo "GSSBA_PID=$GSSBA_PID"
sleep 30
status="$(curl --write-out "%{http_code}\n" --silent --output /dev/null "http://localhost:9080/hello")"
kill $GSSBA_PID
if [ "$status" == "200" ]; then
  echo ENDPOINT OK
else
  echo "$status"
  echo ENDPOINT NOT OK
  exit 1
fi
