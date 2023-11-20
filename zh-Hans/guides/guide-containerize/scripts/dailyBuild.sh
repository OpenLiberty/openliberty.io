#!/bin/bash
while getopts t:d:b:u: flag;
do
    case "${flag}" in
        t) DATE="${OPTARG}";;
        d) DRIVER="${OPTARG}";;
        b) BUILD="${OPTARG}";;
        u) DOCKER_USERNAME="${OPTARG}";;
        *) echo "Invalid option";;
    esac
done

sed -i "\#<artifactId>liberty-maven-plugin</artifactId>#a<configuration><install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install></configuration>" ../start/system/pom.xml ../start/inventory/pom.xml ../finish/system/pom.xml ../finish/inventory/pom.xml
cat ../start/system/pom.xml ../start/inventory/pom.xml ../finish/system/pom.xml ../finish/inventory/pom.xml

sed -i "s;FROM icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi;FROM $DOCKER_USERNAME/olguides:$BUILD;g" system/Dockerfile inventory/Dockerfile
cat system/Dockerfile inventory/Dockerfile

../scripts/testAppFinish.sh
../scripts/testAppStart.sh
