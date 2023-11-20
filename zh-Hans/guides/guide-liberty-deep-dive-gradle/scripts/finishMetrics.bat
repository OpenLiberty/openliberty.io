@echo off

if exist ".\start\inventory" (
    rmdir /s /q ".\start\inventory"
)

mkdir ".\start\inventory"
robocopy %CD%\finish\module-starter\ %CD%\start\inventory\ *.* /e /NFL /NDL /NJH /NJS /nc /ns /np
robocopy %CD%\finish\module-jwt\ %CD%\start\inventory *.* /e /NFL /NDL /NJH /NJS /nc /ns /np
@REM copy ".\finish\system\src\main\liberty\config\resources\security\key.p12" ".\start\inventory\src\main\liberty\config\resources\security\key.p12" 
mkdir ".\start\inventory\src\main\java\io\openliberty\deepdive\rest\health"
copy ".\finish\module-health-checks\src\main\java\io\openliberty\deepdive\rest\health\*.java" ".\start\inventory\src\main\java\io\openliberty\deepdive\rest\health">NUL
copy ".\finish\module-metrics\src\main\liberty\config\server.xml" ".\start\inventory\src\main\liberty\config" >NUL
copy ".\finish\module-metrics\src\main\java\io\openliberty\deepdive\rest\SystemResource.java" ".\start\inventory\src\main\java\io\openliberty\deepdive\rest">NUL

call .\scripts\startSystem.bat

echo Now, you may run following commands to continue the tutorial:
echo cd start\inventory
echo gradlew libertyDev