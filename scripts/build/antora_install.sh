echo "Building the Docs with Antora"
timer_start=$(date +%s)

# Install Antora on the machine
echo "Install Antora"
npm i -g @antora/cli@2.3.3

echo "Building the Antora"
# This section is only a temporary solution until antora 3.0 is released. 
# Then the section below can be removed and the code that is commented out further down can be added back in.
git clone https://gitlab.com/antora/antora.git --branch v2.3.x
npm install -g yarn
cd antora
yarn
cd ..
mv -f src/main/content/_assets/js/custom-include-processor.js antora/node_modules/@antora/asciidoc-loader/lib/include/include-processor.js 
# Remove the section above when upgrading antora to 3.0

if [ "$PROD_SITE" != "true" ]; then
    # add noindex metdata for non prod sites
    cp src/main/content/_includes/noindex.html src/main/content/antora_ui/src/partials/noindex.hbs
fi

pushd src/main/content/antora_ui
echo "Installing Antora dependencies"
# npm install -g @antora/site-generator-default@2.3.3 # add back this line when upgrading antora to 3.0
npm install gulp -g
npm install node-sass gulp-sass --save-dev
npm install
gulp sass:convert
SOURCEMAPS=true gulp build
gulp bundle:pack
popd

timer_end=$(date +%s)
echo "Total execution time for installing Antora & dependencies: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)"

