#!/bin/bash
echo "Building the Docs with Antora"
timer_start=$(date +%s)

# Install Antora on the machine
echo "Install Antora"
npm i -g @antora/cli@3.0.1

echo "Building the Antora"

# add noindex metdata for non-prod/prod sites
cp src/main/content/_includes/noindex.html src/main/content/antora_ui/src/partials/noindex.hbs

pushd src/main/content/antora_ui
echo "Installing Antora dependencies"
npm install -g @antora/site-generator@3.0.1
npm install gulp -g --ignore-scripts
npm install node-sass gulp-sass --save-dev
npm install
SOURCEMAPS=true gulp bundle
popd

timer_end=$(date +%s)
echo "Total execution time for installing Antora & dependencies: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)"

