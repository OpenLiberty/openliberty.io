@echo off

if exist ".\start\inventory\src\test" (
    rmdir /s /q ".\start\inventory\src\test"
)

robocopy %CD%\finish\module-testcontainers\src\test\ %CD%\start\inventory\src\test *.* /e /NFL /NDL /NJH /NJS /nc /ns /np

copy ".\finish\module-testcontainers\pom.xml" ".\start\inventory\pom.xml" >NUL
