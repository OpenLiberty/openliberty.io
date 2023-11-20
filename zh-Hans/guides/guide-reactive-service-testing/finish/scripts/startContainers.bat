@ECHO OFF
set KAFKA_SERVER=kafka:9092
set NETWORK=reactive-app

docker network create %NETWORK%

docker run -d ^
  -e ALLOW_ANONYMOUS_LOGIN=yes ^
  --network=%NETWORK% ^
  --name=zookeeper ^
  --rm ^
  bitnami/zookeeper:3 

start /b docker run -d ^
  -e KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181 ^
  -e ALLOW_PLAINTEXT_LISTENER=yes ^
  -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 ^
  --hostname=kafka ^
  --network=%NETWORK% ^
  --name=kafka ^
  --rm ^
  bitnami/kafka:2

start /b docker run -d ^
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=%KAFKA_SERVER% ^
  -p 9083:9083 ^
  --network=%NETWORK% ^
  --name=system ^
  --rm ^
  system:1.0-SNAPSHOT

start /b docker run -d ^
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=%KAFKA_SERVER% ^
  -p 9085:9085 ^
  --network=%NETWORK% ^
  --name=inventory ^
  --rm ^
  inventory:1.0-SNAPSHOT 
