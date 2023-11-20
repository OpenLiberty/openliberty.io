#!/bin/bash

if [[ -e ./start/inventory ]]; then
    rm -fr ./start/inventory
fi
mkdir ./start/inventory
cp -fr ./finish/module-starter/* ./start/inventory
cp -fr ./finish/module-openapi/* ./start/inventory
echo Now, you may run following commands to continue the tutorial:
echo cd start/inventory
echo ./gradlew libertyDev
