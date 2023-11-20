@echo off 

cd .\finish\system || exit
call mvn liberty:stop
cd ..\..\