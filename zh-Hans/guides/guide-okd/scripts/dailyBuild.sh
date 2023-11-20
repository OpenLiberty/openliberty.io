#!/bin/bash
while getopts t:d:b:u: flag;
do
    case "${flag}" in
        t) DATE="${OPTARG}" ;;
        d) DRIVER="${OPTARG}" ;;
        b) BUILD="${OPTARG}" ;;
        u) DOCKER_USERNAME="${OPTARG}" ;;
        *) echo "Invalid option input" ;;
    esac
done

echo "Testing daily OpenLiberty image"

sed -i "\#<artifactId>liberty-maven-plugin</artifactId>#a<configuration><install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install></configuration>" inventory/pom.xml system/pom.xml
cat inventory/pom.xml system/pom.xml

sed -i "s;FROM openliberty/open-liberty:kernel-java8-openj9-ubi;FROM $DOCKER_USERNAME/olguides:$BUILD;g" inventory/Dockerfile system/Dockerfile
cat inventory/Dockerfile system/Dockerfile

sudo ../scripts/setupOpenshift.sh
sudo ../scripts/testApp.sh
