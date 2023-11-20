#!/bin/bash
while getopts t:d: flag;
do
    case "${flag}" in
        t) DATE="${OPTARG}";;
        d) DRIVER="${OPTARG}";;
        *) echo "Invalid option";;
    esac
done

sed -i "\#end::buildscript#a liberty { install { runtimeUrl=\"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER\"}}" build.gradle
cat build.gradle

../scripts/testApp.sh
