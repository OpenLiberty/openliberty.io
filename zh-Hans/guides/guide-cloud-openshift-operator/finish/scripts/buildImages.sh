#!/bin/bash

docker pull openliberty/open-liberty:kernel-java8-openj9-ubi
oc process -f build.yaml -p APP_NAME=system | oc create -f -
oc process -f build.yaml -p APP_NAME=inventory | oc create -f -
oc start-build system-buildconfig --from-dir=system/.
oc start-build inventory-buildconfig --from-dir=inventory/.