@echo off

if exist .\finish\system\build\wlp\bin (
    call .\finish\system\build\wlp\bin\server.bat status | findStr /c:"is running" && exit /B 0
) 

cd .\finish\system || exit
call gradlew clean war libertyCreate installFeature deploy
call gradlew libertyStart
cd ..\..\