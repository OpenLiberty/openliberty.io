#!/bin/bash
set -euxo pipefail

# TEST 1:  Running the test by using Testcontainers
cd ../postgres

docker build -t postgres-sample .

cd ../finish

mvn -ntp -q clean package

docker pull -q icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

docker build -t inventory:1.0-SNAPSHOT .

sleep 60

mvn -ntp verify

# TEST 2: Running the test by local runtime
docker run --name postgres-container -p 5432:5432 -d postgres-sample

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy
mvn -ntp liberty:start
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    failsafe:integration-test liberty:stop
mvn -ntp failsafe:verify

docker stop postgres-container
docker rm postgres-container