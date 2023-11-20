#!/bin/bash
set -euxo pipefail

./scripts/packageApps.sh

mvn -ntp -pl system liberty:create liberty:install-feature liberty:deploy
mvn -ntp -pl graphql liberty:create liberty:install-feature liberty:deploy

mvn -ntp -pl system liberty:start
mvn -ntp -pl graphql liberty:start

mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -pl system failsafe:integration-test
mvn -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -pl graphql failsafe:integration-test
mvn -ntp -pl system failsafe:verify
mvn -ntp -pl graphql failsafe:verify

mvn -ntp -pl system liberty:stop
mvn -ntp -pl graphql liberty:stop

mvn -ntp -pl query liberty:create liberty:install-feature liberty:deploy

docker pull -q icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

docker build -t system:1.0-java11-SNAPSHOT --build-arg JAVA_VERSION=java11 system/.
docker build -t system:1.0-java17-SNAPSHOT --build-arg JAVA_VERSION=java17 system/.
docker build -t graphql:1.0-SNAPSHOT graphql/.
docker build -t query:1.0-SNAPSHOT query/.

mvn -ntp -pl query verify
