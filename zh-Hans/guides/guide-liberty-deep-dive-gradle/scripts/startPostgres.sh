#!/bin/bash

podman ps | grep -q "postgres-sample" && echo Postgres is running && exit 0

cd ./finish/postgres || exit
podman build -t postgres-sample .
podman run --name postgres-container -p 5432:5432 -d postgres-sample
