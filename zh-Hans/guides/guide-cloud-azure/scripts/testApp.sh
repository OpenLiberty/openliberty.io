#!/bin/bash
set -euxo pipefail

# Test app

mvn -ntp -q clean package

cd inventory
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy
mvn -ntp liberty:start

cd ../system
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy
mvn -ntp liberty:start

cd ..

sleep 120

curl http://localhost:9080/system/properties
curl http://localhost:9081/inventory/systems/

mvn -ntp failsafe:integration-test -Dsystem.ip="localhost" -Dinventory.ip="localhost"
mvn -ntp failsafe:verify

cd inventory
mvn -ntp liberty:stop

cd ../system
mvn -ntp liberty:stop

# Clear .m2 cache
rm -rf ~/.m2
