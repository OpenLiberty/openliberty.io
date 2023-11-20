@echo off

if exist ".\start\inventory" (
    rmdir /s /q ".\start\inventory"
)

mkdir ".\start\inventory"
robocopy %CD%\finish\module-starter\ %CD%\start\inventory\ *.* /e /NFL /NDL /NJH /NJS /nc /ns /np

echo Now, you may run following commands to continue the tutorial:
echo cd start\inventory
echo mvn liberty:dev -DserverStartTimeout=120

