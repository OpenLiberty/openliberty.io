echo "Building the Antora UI"
pushd src/main/content/ui
echo "Installing Antora UI dependencies"
npm install gulp -g
npm install node-sass gulp-sass --save-dev
npm install
gulp sass:convert
gulp build
gulp bundle:pack
popd