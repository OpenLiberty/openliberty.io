#!/bin/bash
set -euxo pipefail

cd system

# Build the system/ app
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy

# Verifies that the system app is functional
mvn -ntp liberty:start
if curl "http://localhost:9080/health" | grep "UP" ; then exit $?; fi
if curl "http://localhost:9080/system/properties" | grep "os.name" ; then exit $?; fi
if curl -k "https://localhost:9443/health" | grep "UP" ; then exit $?; fi
if curl -k "https://localhost:9443/system/properties" | grep "os.name" ; then exit $?; fi
mvn -ntp liberty:stop

# Delete m2 cache after completion
rm -rf ~/.m2
