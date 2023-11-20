#!/bin/bash
set -euxo pipefail

##############################################################################
##
##  GH actions CI test script
##
##############################################################################

# LMP 3.0+ goals are listed here: https://github.com/OpenLiberty/ci.maven#goals
export HOSTNAME=localhost

## Rebuild the application
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package
mvn -ntp -pl system liberty:create 
mvn -ntp -pl system liberty:install-feature 
mvn -ntp -pl system liberty:deploy

mvn -ntp -pl inventory liberty:create 
mvn -ntp -pl inventory liberty:install-feature 
mvn -ntp -pl inventory liberty:deploy

## Run the tests
mvn -ntp -pl system liberty:start
mvn -ntp -pl inventory liberty:start
mvn -ntp verify -Dsystem.ip=localhost:9080 -Dinventory.ip=localhost:8080 
mvn -ntp -pl system liberty:stop 
mvn -ntp -pl inventory liberty:stop
