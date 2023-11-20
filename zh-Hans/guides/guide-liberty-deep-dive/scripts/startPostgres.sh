#!/bin/bash

docker ps | grep -q "postgres-sample" && echo Postgres is running && exit 0

cd ./finish/postgres || exit
docker build -t postgres-sample .
docker run --name postgres-container -p 5432:5432 -d postgres-sample
