#!/bin/bash -e

downloadsDir=$1
export JAVA_HOME=$2
echo "JAVA_HOME=$JAVA_HOME"
echo cd ${downloadsDir}
cd ${downloadsDir}
echo pwd
pwd
echo ls
ls
echo ./gradlew libertyDev
./gradlew libertyDev > ${downloadsDir}/output.txt 2>&1 &
exit 0
