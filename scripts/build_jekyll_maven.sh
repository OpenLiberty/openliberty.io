#  This script contains the end-to-end steps for building the website with Jekyll and using Maven to package
#
#

# Exit immediately if a simple command exits with a non-zero status.
set -e

JEKYLL_BUILD_FLAGS=""

echo "Installing ruby packages..."
gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay uglifier octopress-minify-html
gem install jekyll-assets -v 2.4.0

echo "Ruby version:"
echo `ruby -v`

# Guides that are ready to be published to openliberty.io
echo "Cloning repositories with name starting with guide or iguide..."
ruby ./scripts/build_clone_guides.rb

# Development environment only actions
if [ "$JEKYLL_ENV" != "production" ]; then
    echo "Not in production environment..."
    echo "Adding robots.txt"
    cp robots.txt src/main/content/robots.txt
    
    echo "Clone guides that are only for test site..."
    ruby ./scripts/build_clone_guides.rb "draft-guide"
    JEKYLL_BUILD_FLAGS="--drafts"
fi

# Move any js/css files from guides to the _assets folder for jekyll-assets minification.
echo "Moving any js and css files..."
find src/main/content/guides/iguide* -d -name js -exec cp -R '{}' src/main/content/_assets \;
find src/main/content/guides/iguide* -d -name css -exec cp -R '{}' src/main/content/_assets \;

# Jekyll build
echo "Building with jekyll..."
echo `jekyll -version`
mkdir target
mkdir target/jekyll-webapp
jekyll build $JEKYLL_BUILD_FLAGS --source src/main/content --destination target/jekyll-webapp

# Maven packaging
mvn -B package
