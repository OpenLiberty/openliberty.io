#!/bin/bash

if [[ -e ./start/inventory ]]; then
    rm -fr ./start/inventory
fi
mkdir ./start/inventory
cp -fr ./finish/module-securing/* ./start/inventory

./scripts/startPostgres.sh

echo Now, you may run following commands to continue the tutorial:
echo cd start/inventory
echo mvn liberty:dev -DserverStartTimeout=120
