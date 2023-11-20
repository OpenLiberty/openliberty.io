@echo off

if exist ".\start\inventory" (
    rmdir /s /q ".\start\inventory"
)

mkdir ".\start\inventory"
robocopy %CD%\finish\module-starter\ %CD%\start\inventory *.* /e /NFL /NDL /NJH /NJS /nc /ns /np
robocopy %CD%\finish\module-persisting-data\ %CD%\start\inventory\ *.* /e /NFL /NDL /NJH /NJS /nc /ns /np

call .\scripts\startPostgres.bat

echo Now, you may run following commands to continue the tutorial:
echo cd start\inventory
echo ./gradlew libertyDev