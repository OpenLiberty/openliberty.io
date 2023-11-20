#!/bin/bash

if [[ -e ./start/inventory ]]; then
    rm -fr ./start/inventory
fi
mkdir ./start/inventory
cp -fr ./finish/module-jwt/* ./start/inventory
mkdir -p ./start/inventory/src/main/liberty/config/resources/security
cp ./finish/system/src/main/liberty/config/resources/security/key.p12 ./start/inventory/src/main/liberty/config/resources/security/key.p12
mkdir ./start/inventory/src/main/java/io/openliberty/deepdive/rest/health
cp ./finish/module-health-checks/src/main/java/io/openliberty/deepdive/rest/health/*.java ./start/inventory/src/main/java/io/openliberty/deepdive/rest/health
cp ./finish/module-metrics/src/main/liberty/config/server.xml ./start/inventory/src/main/liberty/config
cp ./finish/module-metrics/src/main/java/io/openliberty/deepdive/rest/SystemResource.java ./start/inventory/src/main/java/io/openliberty/deepdive/rest
cp ./finish/module-kubernetes/Dockerfile ./start/inventory
cp ./finish/module-kubernetes/src/main/liberty/config/server.xml ./start/inventory/src/main/liberty/config/server.xml
mkdir -p ./start/inventory/src/test/java/it/io/openliberty/deepdive/rest
mkdir ./start/inventory/src/test/resources
cp ./finish/module-testcontainers/src/test/java/it/io/openliberty/deepdive/rest/SystemResourceClient.java ./start/inventory/src/test/java/it/io/openliberty/deepdive/rest/SystemResourceClient.java
cp ./finish/module-testcontainers/src/test/java/it/io/openliberty/deepdive/rest/SystemData.java ./start/inventory/src/test/java/it/io/openliberty/deepdive/rest/SystemData.java
cp ./finish/module-testcontainers/src/test/java/it/io/openliberty/deepdive/rest/LibertyContainer.java ./start/inventory/src/test/java/it/io/openliberty/deepdive/rest/LibertyContainer.java
cp ./finish/module-testcontainers/src/test/java/it/io/openliberty/deepdive/rest/SystemResourceIT.java ./start/inventory/src/test/java/it/io/openliberty/deepdive/rest/SystemResourceIT.java
cp ./finish/module-testcontainers/src/test/resources/log4j.properties ./start/inventory/src/test/resources/log4j.properties
cp ./finish/module-testcontainers/pom.xml ./start/inventory/pom.xml


cd ./start/inventory || exit
mvn clean package liberty:create liberty:install-feature liberty:deploy
docker build -t liberty-deepdive-inventory:1.0-SNAPSHOT .
cd ../../
if [[ -e /home/project ]]; then
    docker tag liberty-deepdive-inventory:1.0-SNAPSHOT "us.icr.io/$SN_ICR_NAMESPACE/liberty-deepdive-inventory:1.0-SNAPSHOT"
    docker push "us.icr.io/$SN_ICR_NAMESPACE/liberty-deepdive-inventory:1.0-SNAPSHOT"
fi

./scripts/stopPostgres.sh
./scripts/stopSystem.sh

cd ./finish/postgres || exit
docker build -t postgres-sample .

echo cd start/inventory
echo Now, you may continue to the "Deploying the microservice to Kubernetes" section.

