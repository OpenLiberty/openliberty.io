@echo off

docker stop gateway
docker stop job-service
docker stop inventory-service
docker stop system-service
docker stop kafka
docker stop zookeeper

docker network rm reactive-app
