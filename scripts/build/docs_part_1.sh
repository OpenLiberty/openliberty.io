#!/bin/bash
set -e
export BUILD_SCRIPTS_DIR=$(dirname $0)
echo "BUILD_SCRIPTS_DIR: $BUILD_SCRIPTS_DIR"

$BUILD_SCRIPTS_DIR/node_install.sh

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm use 16
echo "npm analysis during build"
npm ls -g --depth=0

#comment out this below two line in local during build
ln -s "$(which node)" /usr/bin/node
ln -s "$(which npm)" /usr/bin/npm

#Antora Portion of Docs
echo "Begin building of Antora portion of docs"

$BUILD_SCRIPTS_DIR/antora_install.sh

# Use the Antora playbook to download the docs and build the doc pages
timer_start=$(date +%s)
$BUILD_SCRIPTS_DIR/antora_clone_playbook.sh

$BUILD_SCRIPTS_DIR/antora_build_docs.sh
timer_end=$(date +%s)
echo "Total execution time for cloning playbook and building docs via Antora: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"

echo "Finished building and prepping all Antora content"
