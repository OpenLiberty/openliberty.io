@echo off 

cd .\start\inventory || exit
call mvn liberty:stop
cd ..\..\