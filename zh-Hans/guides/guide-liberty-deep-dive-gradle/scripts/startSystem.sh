#!/bin/bash

if [[ -e ./finish/system/build/wlp/bin ]]; then
    ./finish/system/build/wlp/bin/server status | grep "is running" && exit 0
fi

cd ./finish/system || exit
./gradlew clean war libertyCreate installFeature deploy
./gradlew libertyStart
