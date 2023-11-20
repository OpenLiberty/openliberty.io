@echo off

podman ps | findStr "postgres-sample" >NUL && echo Postgres is running && exit /B 0

cd .\finish\postgres || exit
podman build -t postgres-sample .
podman run --name postgres-container -p 5432:5432 -d postgres-sample
cd ..\..\
