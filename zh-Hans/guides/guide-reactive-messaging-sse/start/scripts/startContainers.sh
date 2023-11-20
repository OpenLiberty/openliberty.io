#!/bin/bash

KAFKA_SERVER=kafka:9092
NETWORK=reactive-app

docker network create $NETWORK

docker run -d \
  -e ALLOW_ANONYMOUS_LOGIN=yes \
  --network=$NETWORK \
  --name=zookeeper \
  --rm \
  bitnami/zookeeper:3 &

docker run -d \
  -e KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181 \
  -e ALLOW_PLAINTEXT_LISTENER=yes \
  -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 \
  --hostname=kafka \
  --network=$NETWORK \
  --name=kafka \
  --rm \
  bitnami/kafka:2 &
  
sleep 15

docker run -d \
  -e UPDATE_INTERVAL=3 \
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER \
  --network=$NETWORK \
  --name=system1 \
  --rm \
  system:1.0-SNAPSHOT &

  docker run -d \
  -e UPDATE_INTERVAL=2 \
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER \
  --network=$NETWORK \
  --name=system2 \
  --rm \
  system:1.0-SNAPSHOT &

  docker run -d \
  -e UPDATE_INTERVAL=6 \
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER \
  --network=$NETWORK \
  --name=system3 \
  --rm \
  system:1.0-SNAPSHOT &

docker run -d \
  -p 9084:9084 \
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER \
  --network=$NETWORK \
  --name=bff \
  --rm \
  bff:1.0-SNAPSHOT &

docker run -d \
  -p 9080:9080 \
  --network=$NETWORK \
  --name=frontend \
  --rm \
  frontend:1.0-SNAPSHOT &
  
wait