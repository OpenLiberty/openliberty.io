#!/bin/bash

mvn -ntp -pl models clean install
mvn -ntp clean package