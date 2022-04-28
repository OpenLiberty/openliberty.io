#!/bin/bash
echo "Building the Antora UI"
timer_start=$(date +%s)

# add noindex metdata for non-prod/prod sites
cp src/main/content/_includes/noindex.html src/main/content/antora_ui/src/partials/noindex.hbs

# Build the Antora UI look and feel (based on antora-ui-default)
pushd src/main/content/antora_ui
echo "Installing Antora dependencies"
rm -rf node_modules
npm install -g @antora/site-generator@3.0.1
npm install gulp -g --ignore-scripts
npm install node-sass gulp-sass --save-dev
npm install
gulp sass:convert
SOURCEMAPS=true gulp build
gulp bundle:pack
popd

timer_end=$(date +%s)
echo "Total execution time for installing Antora & dependencies: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)"
