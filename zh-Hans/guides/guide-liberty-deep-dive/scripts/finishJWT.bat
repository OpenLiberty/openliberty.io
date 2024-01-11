@echo off

if exist ".\start\inventory" (
    rmdir /s /q ".\start\inventory"
)

mkdir ".\start\inventory"
robocopy %CD%\finish\module-jwt\ %CD%\start\inventory *.* /e /NFL /NDL /NJH /NJS /nc /ns /np
copy ".\finish\system\src\main\liberty\config\resources\security\key.p12" ".\start\inventory\src\main\liberty\config\resources\security\key.p12" >NUL

call .\scripts\startSystem.bat
call .\scripts\startPostgres.bat

echo Now, you may run following commands to continue the tutorial:
echo cd start\inventory
echo mvn liberty:dev -DserverStartTimeout=120