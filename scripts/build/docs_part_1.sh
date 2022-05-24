#!/bin/bash
#comment this below line in local if nvm already installed
RUN echo "Install Node"

# Cannot find a way to set the NODE_VERSION based on the version installed by `nvm install --lts`
ENV NODE_VERSION="v16.13.2"
ENV NVM_DIR=/root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN . "$NVM_DIR/nvm.sh" && nvm install --lts
RUN . "$NVM_DIR/nvm.sh" && node --version
RUN . "$NVM_DIR/nvm.sh" && npm --version
ENV PATH="/root/.nvm/versions/node/${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

set -e
export BUILD_SCRIPTS_DIR=$(dirname $0)
echo "BUILD_SCRIPTS_DIR: $BUILD_SCRIPTS_DIR"

#Antora Portion of Docs
# echo "Begin building of Antora portion of docs"

# $BUILD_SCRIPTS_DIR/node_install.sh

#$BUILD_SCRIPTS_DIR/antora_install.sh
# Install Antora on the machine
echo "Install Antora"
RUN npm i -g @antora/cli@3.0.1

$BUILD_SCRIPTS_DIR/antora_build_ui.sh

# Use the Antora playbook to download the docs and build the doc pages
timer_start=$(date +%s)
$BUILD_SCRIPTS_DIR/antora_clone_playbook.sh

$BUILD_SCRIPTS_DIR/antora_build_docs.sh
timer_end=$(date +%s)
echo "Total execution time for cloning playbook and building docs via Antora: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"

# Copy the contents generated by Antora to the website folder
echo "Moving the Antora docs to the jekyll webapp"
timer_start=$(date +%s)
mkdir -p target/jekyll-webapp/docs/
cp -r src/main/content/docs/build/site/. target/jekyll-webapp/
timer_end=$(date +%s)
echo "Total execution time for copying Antora docs to webapp: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"

echo "Finished building and prepping all Antora content"
