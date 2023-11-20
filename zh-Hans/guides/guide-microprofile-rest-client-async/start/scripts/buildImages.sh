#!/bin/bash

echo Building images

docker build -t system:1.0-SNAPSHOT system/. &
docker build -t inventory:1.0-SNAPSHOT inventory/. &
docker build -t query:1.0-SNAPSHOT query/. &

wait
echo Images building completed
