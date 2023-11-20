@echo off

if exist .\finish\system\target\liberty\wlp\bin (
    call .\finish\system\target\liberty\wlp\bin\server.bat status | findStr /c:"is running" && exit /B 0
) 

cd .\finish\system || exit
call mvn clean package liberty:create liberty:install-feature liberty:deploy
call mvn liberty:start
cd ..\..\