echo "Building the Antora UI"
pushd src/main/content/antora_ui
echo "Installing Antora UI dependencies"
npm install gulp -g
npm install node-sass gulp-sass --save-dev
npm install
gulp sass:convert
SOURCEMAPS=true gulp build
gulp bundle:pack
popd