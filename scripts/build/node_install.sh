#!/bin/bash
# Install the latest node version using nvm (Node Version Manager)
timer_start=$(date +%s)

echo "Install Node"
#comment this below line in local if nvm already installed
# Cannot find a way to set the NODE_VERSION based on the version installed by `nvm install --lts`
export NODE_VERSION="v16.15.0"
export NVM_DIR=/root/.nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
. "$NVM_DIR/nvm.sh" && nvm install --lts
. "$NVM_DIR/nvm.sh" && nvm alias default node
. "$NVM_DIR/nvm.sh" && nvm use --lts
export PATH="/root/.nvm/versions/node/${NODE_VERSION}/bin/:${PATH}"
node --version
npm --version
echo "npm analysis during build"
npm ls -g --depth=0

timer_end=$(date +%s)
echo "Total execution time for installing Node: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"