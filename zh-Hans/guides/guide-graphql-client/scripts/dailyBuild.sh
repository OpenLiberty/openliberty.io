#!/bin/bash
while getopts t:d:b:u: flag;
do
    case "${flag}" in
        t) DATE="${OPTARG}";;
        d) DRIVER="${OPTARG}";;
        b) BUILD="${OPTARG}";;
        u) DOCKER_USERNAME="${OPTARG}";;
    esac
done

sed -i "\#<artifactId>liberty-maven-plugin</artifactId>#a<configuration><install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/"$DATE"/"$DRIVER"</runtimeUrl></install></configuration>" query/pom.xml system/pom.xml
sed -i "\#<looseApplication>false</looseApplication>#a<install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/"$DATE"/"$DRIVER"</runtimeUrl></install>"  graphql/pom.xml
cat query/pom.xml graphql/pom.xml system/pom.xml

sed -i "s;FROM icr.io/appcafe/open-liberty:kernel-slim-..JAVA_VERSION.-openj9-ubi;FROM $DOCKER_USERNAME/olguides:$BUILD;g" system/Dockerfile graphql/Dockerfile query/Dockerfile
sed -i "s;RUN features.sh;#RUN features.sh;g" system/Dockerfile graphql/Dockerfile query/Dockerfile
cat system/Dockerfile graphql/Dockerfile query/Dockerfile

docker pull "$DOCKER_USERNAME""/olguides:""$BUILD"

sudo ../scripts/testApp.sh
