@echo off 

cd .\finish\system || exit
call gradlew libertyStop
cd ..\..\