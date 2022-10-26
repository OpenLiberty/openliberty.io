#!/bin/bash
# Install the latest node version using nvm (Node Version Manager)
timer_start=$(date +%s)

echo "Install Node"
#comment this below line in local if nvm already installed
export NVM_DIR=/root/.nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
. "$NVM_DIR/nvm.sh" && nvm install 16
. "$NVM_DIR/nvm.sh" && nvm alias default node
. "$NVM_DIR/nvm.sh" && nvm use 16
. "$NVM_DIR/nvm.sh" && export NODE_VERSION=$(node --version)
export PATH="/root/.nvm/versions/node/${NODE_VERSION}/bin/:${PATH}"
echo "$PATH"
echo "node --version"
node --version
echo "npm --version"
npm --version
echo "ls -g --depth=0"
npm ls -g --depth=0

timer_end=$(date +%s)
echo "Total execution time for installing Node: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"
