#!/bin/bash
set -euxo pipefail

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -pl system -q clean package liberty:create liberty:install-feature liberty:deploy

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -pl query -q clean package liberty:create liberty:install-feature liberty:deploy

mvn -pl system -ntp liberty:start
mvn -pl query -ntp liberty:start

mvn -pl system -ntp failsafe:integration-test
mvn -pl query -ntp failsafe:integration-test

mvn -pl system -ntp liberty:stop
mvn -pl query -ntp liberty:stop
