#!/bin/bash
set -euxo pipefail

./gradlew -version
./gradlew tasks
./gradlew clean
cat ./build.gradle
./gradlew build -b ./build.gradle -x openBrowser -i
curl http://localhost:9080/GradleSample/servlet | grep Hello
./gradlew libertyStop
