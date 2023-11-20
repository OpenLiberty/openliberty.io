#!/bin/bash
set -euxo pipefail

testApp() {
    mvn -ntp -Dhttp.keepAlive=false \
        -Dmaven.wagon.http.pool=false \
        -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
        -pl system,inventory -q clean package liberty:create liberty:install-feature liberty:deploy

    mvn -ntp -pl system,inventory liberty:start

    mvn -ntp -Dhttp.keepAlive=false \
        -Dmaven.wagon.http.pool=false \
        -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
        -pl system,inventory failsafe:integration-test

    mvn -ntp -pl system,inventory liberty:stop

    mvn -ntp -pl system,inventory failsafe:verify
}

testApp
cd ../start
testApp
