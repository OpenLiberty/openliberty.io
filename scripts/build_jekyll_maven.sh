#  This script contains the end-to-end steps for building the website with Jekyll and using Maven to package
#
#
echo "Installing ruby packages..."
gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay uglifier octopress-minify-html
gem install jekyll-assets -v 2.4.0

# List of static guides
echo "Cloning guides..."
git clone "https://github.com/OpenLiberty/guides-common.git" src/main/content/guides/guides-common
git clone "https://github.com/OpenLiberty/guide-rest-intro.git" src/main/content/guides/guide_rest_intro
git clone "https://github.com/OpenLiberty/guide-maven-intro.git" src/main/content/guides/guide_maven_intro
git clone "https://github.com/OpenLiberty/guide-microprofile-intro.git" src/main/content/guides/guide_microprofile_intro
git clone "https://github.com/OpenLiberty/guide-rest-hateoas.git" src/main/content/guides/guide_rest_hateoas
git clone "https://github.com/OpenLiberty/guide-rest-client-java.git" src/main/content/guides/guide_rest_client_java
git clone "https://github.com/OpenLiberty/guide-maven-multimodules.git" src/main/content/guides/guide_maven_multimodules
git clone "https://github.com/OpenLiberty/guide-cors.git" src/main/content/guides/guide_cors
git clone "https://github.com/OpenLiberty/guide-rest-client-angularjs.git" src/main/content/guides/guide-rest-client-angularjs

# List of interactive guides
git clone "https://github.com/OpenLiberty/iguides-common.git" --branch master --single-branch src/main/content/guides/iguides-common
git clone "https://github.com/OpenLiberty/iguide-circuit-breaker.git" --branch master --single-branch src/main/content/guides/iguide-circuit-breaker

# Development environment only actions
if [ "$JEKYLL_ENV" != "production" ]; then
    echo "Not in production environment..."
    echo "Adding robots.txt"
    cp robots.txt src/main/content/robots.txt
    
    echo "Clone guides that are only for test site..."
    git clone "https://github.com/OpenLiberty/guide-microprofile-config.git" src/main/content/guides/guide_microprofile_config
    git clone "https://github.com/OpenLiberty/iguide-microprofile-config.git" src/main/content/guides/iguide-microprofile-config
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
jekyll build --source src/main/content --destination target/jekyll-webapp

# Maven packaging
mvn -B package
