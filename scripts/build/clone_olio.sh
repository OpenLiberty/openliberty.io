#!/bin/bash

BRANCH_NAME="prod"
# Input step clones the git repo to root folder, we need to delete that content first.
ls -la
# Delete everything that doesn't start with an underscore
ls -A | grep -v ^_.* | xargs rm -rf
ls -la
# Can't clone directly into root because it exists and is not empty
git clone --single-branch --branch $BRANCH_NAME https://github.com/OpenLiberty/openliberty.io.git
mv ./openliberty.io/{*,.[^.]*} ./
ls -lA
echo "Environment cleanup complete, starting build process"
