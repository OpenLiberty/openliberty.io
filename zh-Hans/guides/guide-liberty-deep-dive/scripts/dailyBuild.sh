#!/bin/bash
while getopts t:d:b:u: flag; do
    case "${flag}" in
    t) DATE="${OPTARG}" ;;
    d) DRIVER="${OPTARG}" ;;
    b) BUILD="${OPTARG}";;
    u) DOCKER_USERNAME="${OPTARG}";;
    *) echo "Invalid option" ;;
    esac
done

echo "Testing daily build image"

sed -i "\#<artifactId>liberty-maven-plugin</artifactId>#a<configuration><install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install></configuration>" system/pom.xml module-getting-started/pom.xml module-openapi/pom.xml module-config/pom.xml
cat system/pom.xml
cat module-getting-started/pom.xml
cat module-openapi/pom.xml
cat module-config/pom.xml

sed -i "\#<configuration>#a<install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install>" module-persisting-data/pom.xml module-securing/pom.xml module-jwt/pom.xml module-testcontainers/pom.xml
cat module-persisting-data/pom.xml
cat module-securing/pom.xml
cat module-jwt/pom.xml
cat module-testcontainers/pom.xml

sed -i "s;FROM icr.io/appcafe/open-liberty:full-java11-openj9-ubi;FROM $DOCKER_USERNAME/olguides:$BUILD;g" module-kubernetes/Dockerfile
cat module-kubernetes/Dockerfile

sudo -u runner ../scripts/testApp.sh
