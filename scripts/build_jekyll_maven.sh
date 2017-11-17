#  This script contains the end-to-end steps for building the website with Jekyll and using Maven to package
#
#
gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay jekyll-assets uglifier octopress-minify-html
git clone "https://github.com/OpenLiberty/guides-common.git" src/main/content/guides/guides-common
git clone "https://github.com/OpenLiberty/guide-rest-intro.git" src/main/content/guides/guide_rest_intro
git clone "https://github.com/OpenLiberty/guide-maven-intro.git" src/main/content/guides/guide_maven_intro
git clone "https://github.com/OpenLiberty/guide-microprofile-intro.git" src/main/content/guides/guide_microprofile_intro
git clone "https://github.com/OpenLiberty/guide-rest-hateoas.git" src/main/content/guides/guide_rest_hateoas
git clone "https://github.com/OpenLiberty/guide-rest-client-java" src/main/content/guides/guide_rest_client_java
git clone "https://github.com/OpenLiberty/guide-maven-multimodules" src/main/content/guides/guide_maven_multimodules
git clone "https://github.com/OpenLiberty/guide-cors" src/main/content/guides/guide_cors

# Clone the circuit breaker interactive guide.
git clone "https://github.com/OpenLiberty/iguides-common" --branch master --single-branch src/main/content/guides/iguides-common
git clone "https://github.com/OpenLiberty/iguide-circuit-breaker" --branch master --single-branch src/main/content/guides/iguide-circuit-breaker
# Move any js/css files from guides to the _assets folder for jekyll-assets minification.
find src/main/content/guides/iguide* -d -name js -exec cp -R '{}' src/main/content/_assets \;
find src/main/content/guides/iguide* -d -name css -exec cp -R '{}' src/main/content/_assets \;

# Not in production environment
if [ ${JEKYLL_ENV} != "production" ]; then
    echo "Not in production environment..."
    echo "Adding robots.txt"
    cp robots.txt src/main/content/robots.txt
    
    echo "Clone guides that are only for test site..."
    git clone "https://github.com/OpenLiberty/guide-microprofile-config.git" src/main/content/guides/guide_microprofile_config
fi

mkdir target
mkdir target/jekyll-webapp
jekyll build --source src/main/content --destination target/jekyll-webapp

# Maven packaging
mvn -B package
