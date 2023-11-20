#!/bin/bash

docker stop system1 system2 system3 bff frontend kafka zookeeper
docker network rm reactive-app