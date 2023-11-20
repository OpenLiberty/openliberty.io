#!/bin/bash

echo Building images

docker pull -q bitnami/zookeeper:3
docker pull -q bitnami/kafka:2

docker build -t system:1.0-SNAPSHOT system/. &
docker build -t inventory:1.0-SNAPSHOT inventory/. &

wait
echo Images building completed
