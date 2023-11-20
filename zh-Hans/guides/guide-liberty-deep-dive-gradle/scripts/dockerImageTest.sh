#!/bin/bash
while getopts t:d:b:u: flag;
do
    case "${flag}" in
        t) DATE="${OPTARG}";;
        d) DRIVER="${OPTARG}";;
        *) echo "Invalid option";;
    esac
done

echo "Testing daily Docker image"


export RUNTIMEURL="liberty {\n    install {\n        runtimeUrl='https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER'\n    }\n}\n"

sed -i "s;clean.dependsOn;$RUNTIMEURL\nclean.dependsOn;g" module-jwt/build.gradle module-getting-started/build.gradle system/build.gradle module-config/build.gradle module-securing/build.gradle module-openapi/build.gradle
echo "=== module-jwt/build.gradle ==="
cat module-jwt/build.gradle
echo "=== module-getting-started/build.gradle ==="
cat module-getting-started/build.gradle
echo "=== system/build.gradle ==="
cat system/build.gradle
echo "=== module-config/build.gradle ==="
cat module-config/build.gradle
echo "=== module-securing/build.gradle ==="
cat module-securing/build.gradle
echo "=== module-openapi/build.gradle ==="
cat module-openapi/build.gradle

sed -i "s;FROM icr.io/appcafe/open-liberty:full-java11-openj9-ubi;FROM openliberty/daily:latest;g" module-kubernetes/Containerfile
cat module-kubernetes/Containerfile

podman pull "openliberty/daily:latest"

../scripts/testApp.sh
