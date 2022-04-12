#!/bin/bash
docker build --target ruby -t myruby:latest . &&
docker build --target jekyll -t myjekyll:latest . &&
docker build --target javadocs -t myjavadocs:latest . &&
docker build --target docs1 -t mydocs1:latest . &&
docker build --target docs2 -t mydocs2:latest . &&
docker build --target docs3 -t mydocs3:latest . &&
docker build --target runtime -t myruntime:latest .
