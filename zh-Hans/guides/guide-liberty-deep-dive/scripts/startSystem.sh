#!/bin/bash

if [[ -e ./finish/system/target/liberty/wlp/bin ]]; then
    ./finish/system/target/liberty/wlp/bin/server status | grep "is running" && exit 0
fi

cd ./finish/system || exit
mvn clean package liberty:create liberty:install-feature liberty:deploy
mvn liberty:start
