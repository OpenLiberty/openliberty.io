@echo off

docker ps | findStr "postgres-sample" >NUL && echo Postgres is running && exit /B 0

cd .\finish\postgres || exit
docker build -t postgres-sample .
docker run --name postgres-container -p 5432:5432 -d postgres-sample
cd ..\..\
