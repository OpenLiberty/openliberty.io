#!/bin/bash
set -euxo pipefail

##############################################################################
##
##  GH actions CI test script
##
##############################################################################

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -ntp -pl system -q clean package liberty:create liberty:install-feature liberty:deploy
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -ntp -pl client -q clean package liberty:create liberty:install-feature liberty:deploy

mvn -ntp -pl system liberty:start
mvn -ntp -pl client liberty:start

mvn -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -ntp -pl system failsafe:integration-test

sleep 20
grep loadAverage client/target/liberty/wlp/usr/servers/defaultServer/logs/messages.log || exit 1
grep memoryUsage client/target/liberty/wlp/usr/servers/defaultServer/logs/messages.log || exit 1

mvn -ntp -pl system liberty:stop
mvn -ntp -pl client liberty:stop

mvn -ntp failsafe:verify
