#  This script contains the end-to-end steps for building the website with Jekyll and using Maven to package
#
#

# Exit immediately if a simple command exits with a non-zero status.
set -e

JEKYLL_BUILD_FLAGS=""

echo "Installing ruby packages..."
gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay uglifier octopress-minify-html octokit
gem install jekyll-assets -v 2.4.0

echo "Ruby version:"
echo `ruby -v`

# Special handling for javadocs
./scripts/modify_javadoc.sh
pushd gems/ol-asciidoc
gem build ol-asciidoc.gemspec
gem install ol-asciidoc-0.0.1.gem
popd

# Guides that are ready to be published to openliberty.io
echo "Cloning repositories with name starting with guide or iguide..."
ruby ./scripts/build_clone_guides.rb

# Development environment only actions
if [ "$JEKYLL_ENV" != "production" ]; then
    echo "Not in production environment..."
    echo "Adding robots.txt"
    cp robots.txt src/main/content/robots.txt
    
    echo "Clone draft guides for test environments..."
    ruby ./scripts/build_clone_guides.rb "draft-guide"
    ./scripts/build_clone_docs.sh "develop" # Argument is branch name of OpenLiberty/docs

    # Need to make sure there are draft-iguide* folders before using the find command
    # If we don't, the find command will fail because the path does not exist
    if [ $(find src/main/content/guides -type d -name "draft-iguide*" | wc -l ) != "0" ] ; then
        echo "Moving any js and css files from draft interactive guides..."
        find src/main/content/guides/draft-iguide* -d -name js -exec cp -R '{}' src/main/content/_assets \;
        find src/main/content/guides/draft-iguide* -d -name css -exec cp -R '{}' src/main/content/_assets \;
    fi

    # Include draft blog posts for non production environments
    JEKYLL_BUILD_FLAGS="--drafts"
else
    # Production!
    echo "Clone published docs!"
    # TODO: comment this out when we are ready to clone master
    # ./scripts/build_clone_docs.sh "master" # Argument is branch name of OpenLiberty/docs
fi

# Move any js/css files from guides to the _assets folder for jekyll-assets minification.
echo "Moving any js and css files published interactive guides..."
# Assumption: There is _always_ iguide* folders
find src/main/content/guides/iguide* -d -name js -exec cp -R '{}' src/main/content/_assets \;
find src/main/content/guides/iguide* -d -name css -exec cp -R '{}' src/main/content/_assets \;

# Build draft and published blogs
./scripts/build_clone_blogs.sh

# Jekyll build
echo "Building with jekyll..."
echo `jekyll -version`
mkdir -p target/jekyll-webapp
jekyll build $JEKYLL_BUILD_FLAGS --source src/main/content --destination target/jekyll-webapp
python3 ./scripts/parse-feature-toc.py

# Maven packaging
echo "Running maven (mvn)..."
mvn -B package
