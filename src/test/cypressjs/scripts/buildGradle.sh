#!/bin/bash -e

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
