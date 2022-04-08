#!/bin/bash -e

echo "JAVA_HOME=$JAVA_HOME"

downloadsDir=$1
echo cd ${downloadsDir}
cd ${downloadsDir}
echo pwd
pwd
echo ls
ls
echo mvnw liberty:dev -e
./mvnw liberty:dev > ${downloadsDir}/output.txt 2>&1 &
exit 0
