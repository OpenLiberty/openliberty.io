#!/bin/bash
set -euxo pipefail

# Package the system/ and inventory/ apps
mvn -ntp -q -pl models install
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package

# Verifies that the system/inventory apps are functional
mvn -ntp -pl system verify
mvn -ntp -pl inventory verify

# Delete m2 cache after completion
rm -rf ~/.m2
