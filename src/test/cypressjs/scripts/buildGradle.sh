#!/bin/bash -e

echo "JAVA_HOME=$JAVA_HOME"

downloadsDir=$1
echo cd ${downloadsDir}
cd ${downloadsDir}
echo pwd
pwd
echo ls
ls
echo ./gradlew libertyDev
./gradlew libertyDev > ${downloadsDir}/output.txt 2>&1 &
exit 0
