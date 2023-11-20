#!/bin/bash
set -euxo pipefail

##############################################################################
##
##  GH actions CI test script
##
##############################################################################

# LMP 3.0+ goals are listed here: https://github.com/OpenLiberty/ci.maven#goals

## Rebuild the application
#       package                   - Take the compiled code and package it in its distributable format.
#       liberty:create            - Create a Liberty server.
#       liberty:install-feature   - Install a feature packaged as a Subsystem Archive (esa) to the Liberty runtime.
#       liberty:deploy            - Copy applications to the Liberty server's dropins or apps directory.
mvn -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -q clean package liberty:create liberty:install-feature liberty:deploy

## Run the tests
# These commands are separated because if one of the commands fail, the test script will fail and exit.
# e.g if liberty:start fails, then there is no need to run the failsafe commands.
#       liberty:start             - Start a Liberty server in the background.
#       failsafe:integration-test - Runs the integration tests of an application.
#       liberty:stop              - Stop a Liberty server.
#       failsafe:verify           - Verifies that the integration tests of an application passed.
mvn liberty:start
mvn -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    failsafe:integration-test liberty:stop
mvn failsafe:verify

sudo add-apt-repository ppa:cncf-buildpacks/pack-cli
sudo apt-get update
sudo apt-get install pack-cli

pack config default-builder gcr.io/paketo-buildpacks/builder:base

pack build \
  --env BP_JAVA_APP_SERVER=liberty \
  --env BP_MAVEN_BUILT_ARTIFACT="target/*.[ejw]ar src/main/liberty/config/*" \
  --env BP_LIBERTY_PROFILE=jakartaee9 \
  --buildpack paketo-buildpacks/eclipse-openj9 \
  --buildpack paketo-buildpacks/java \
  --creation-time now system:1.0-SNAPSHOT

docker run --rm -d --name system -p 9080:9080 system:1.0-SNAPSHOT

sleep 20

docker logs system

curl "http://localhost:9080/system/properties" | grep os.name || exit 1

docker stop system
