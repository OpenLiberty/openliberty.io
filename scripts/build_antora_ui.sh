echo "Building the Antora UI"
pushd src/main/content/antora_ui
echo "Installing Antora UI dependencies"
npm install -g @antora/site-generator-default@2.3.3
npm install gulp -g
npm install node-sass gulp-sass --save-dev
npm install
gulp sass:convert
SOURCEMAPS=true gulp build
gulp bundle:pack
popd