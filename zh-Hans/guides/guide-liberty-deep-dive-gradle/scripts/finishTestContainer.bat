@echo off

if exist ".\start\inventory" (
    rmdir /s /q ".\start\inventory"
)

mkdir ".\start\inventory"
robocopy %CD%\finish\module-jwt\ %CD%\start\inventory *.* /e /NFL /NDL /NJH /NJS /nc /ns /np

copy ".\finish\system\src\main\liberty\config\resources\security\key.p12" ".\start\inventory\src\main\liberty\config\resources\security\key.p12" >NUL
mkdir ".\start\inventory\src\main\java\io\openliberty\deepdive\rest\health"
copy ".\finish\module-health-checks\src\main\java\io\openliberty\deepdive\rest\health\*.java" ".\start\inventory\src\main\java\io\openliberty\deepdive\rest\health" >NUL
copy ".\finish\module-metrics\src\main\liberty\config\server.xml" ".\start\inventory\src\main\liberty\config" >NUL
copy ".\finish\module-metrics\src\main\java\io\openliberty\deepdive\rest\SystemResource.java" ".\start\inventory\src\main\java\io\openliberty\deepdive\rest" >NUL
copy ".\finish\module-kubernetes\Dockerfile" ".\start\inventory" >NUL
copy ".\finish\module-kubernetes\src\main\liberty\config\server.xml" ".\start\inventory\src\main\liberty\config\server.xml" >NUL

mkdir ".\start\inventory\src\test\java\it\io\openliberty\deepdive\rest"
mkdir ".\start\inventory\src\test\resources"
copy ".\finish\module-testcontainers\src\test\java\it\io\openliberty\deepdive\rest\SystemResourceClient.java" ".\start\inventory\src\test\java\it\io\openliberty\deepdive\rest\SystemResourceClient.java"
copy ".\finish\module-testcontainers\src\test\java\it\io\openliberty\deepdive\rest\SystemData.java" ".\start\inventory\src\test\java\it\io\openliberty\deepdive\rest\SystemData.java"
copy ".\finish\module-testcontainers\src\test\java\it\io\openliberty\deepdive\rest\LibertyContainer.java" ".\start\inventory\src\test\java\it\io\openliberty\deepdive\rest\LibertyContainer.java"
copy ".\finish\module-testcontainers\src\test\java\it\io\openliberty\deepdive\rest\SystemResourceIT.java" ".\start\inventory\src\test\java\it\io\openliberty\deepdive\rest\SystemResourceIT.java"
copy ".\finish\module-testcontainers\src\test\resources\log4j.properties" ".\start\inventory\src\test\resources\log4j.properties"
copy ".\finish\module-testcontainers\pom.xml" ".\start\inventory\pom.xml"

cd .\start\inventory || exit
call mvn clean package liberty:create liberty:install-feature liberty:deploy
docker build -t liberty-deepdive-inventory:1.0-SNAPSHOT .
cd ..\..\

call .\scripts\stopPostgres.bat
call .\scripts\stopSystem.bat

cd .\finish\postgres || exit
docker build -t postgres-sample .
cd ..\..\

echo Now, you may continue to the "Testing the microservice with Testcontainers" section.
