#!/bin/bash -e

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
