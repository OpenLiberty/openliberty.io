echo "Building the Antora UI"

# This section is only a temporary solution until antora 3.0 is released. 
# Then the section below can be removed and the code that is commented out further down can be added back in.
git clone https://gitlab.com/antora/antora.git --branch v2.3.x
npm install -g yarn
cd antora
yarn
cd ..
mv -f src/main/content/_assets/js/custom-include-processor.js antora/node_modules/@antora/asciidoc-loader/lib/include/include-processor.js 
# Remove the section above when upgrading antora to 3.0

pushd src/main/content/antora_ui
echo "Installing Antora UI dependencies"
# npm install -g @antora/site-generator-default@2.3.3 # add back this line when upgrading antora to 3.0
npm install gulp -g
npm install node-sass gulp-sass --save-dev
npm install
gulp sass:convert
SOURCEMAPS=true gulp build
gulp bundle:pack
popd