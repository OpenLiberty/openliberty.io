#!/bin/bash
set -euxo pipefail

# LMP 3.0+ goals are listed here: https://github.com/OpenLiberty/ci.maven#goals

# Required environment variable
export GITHUB_CLIENT_ID=placeholder
export GITHUB_CLIENT_SECRET=placeholder

## Rebuild the application
#       package                   - Take the compiled code and package it in its distributable format.
#       liberty:create            - Create a Liberty server.
#       liberty:install-feature   - Install a feature packaged as a Subsystem Archive (esa) to the Liberty runtime.
#       liberty:deploy            - Copy applications to the Liberty server's dropins or apps directory. 
mvn -ntp -Dhttp.keepAlive=false \
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
mvn -ntp liberty:start

# Check that the endpoint returns 200
STATUS="$(curl --write-out "%{http_code}\n" --silent --output /dev/null "http://localhost:9080/api/hello.html")"
if [ "${STATUS}" -ne "200" ]
    then
        echo "FAIL: Endpoint returned ${STATUS}, expected 200."
        exit 1
    else
        echo "Return code check passed."
fi

# Check that the endpoint redirects to the social media selection form
RESPONSE=$(curl --silent -k "https://localhost:9443/api/hello" | grep "https://github.com/login/oauth/authorize")
if [ -z "${RESPONSE}" ]
    then
        echo "FAIL: Could not find string literal \"https://github.com/login/oauth/authorize\" in response."
        exit 1
    else
        echo "Response body check passed."
fi

mvn -ntp liberty:stop
