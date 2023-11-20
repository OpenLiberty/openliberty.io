#!/bin/bash

NETWORK=graphql-app

docker network create $NETWORK

docker run -d \
  --network=$NETWORK \
  --name=system-java11 \
  --hostname=java11 \
  --rm \
  system:1.0-java11-SNAPSHOT &

docker run -d \
  --network=$NETWORK \
  --name=system-java17 \
  --hostname=java17 \
  --rm \
  system:1.0-java17-SNAPSHOT &

docker run -d \
  -p 9082:9082 \
  --network=$NETWORK \
  --name=graphql \
  --rm \
  graphql:1.0-SNAPSHOT &

wait
