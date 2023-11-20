@ECHO Starting Scripts
@ECHO OFF

start /b docker build -q -t system:1.0-SNAPSHOT system\.
start /b docker build -q -t inventory:1.0-SNAPSHOT inventory\.
start /b docker build -q -t query:1.0-SNAPSHOT query\.
