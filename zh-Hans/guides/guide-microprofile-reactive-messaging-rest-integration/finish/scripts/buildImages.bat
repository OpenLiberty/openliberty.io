@ECHO Starting Scripts
@ECHO OFF

start /b docker pull bitnami/zookeeper:3
start /b docker pull bitnami/kafka:2

start /b docker build -q -t system:1.0-SNAPSHOT system\.
start /b docker build -q -t inventory:1.0-SNAPSHOT inventory\.
