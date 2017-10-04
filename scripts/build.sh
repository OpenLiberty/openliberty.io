sudo apt-get update
sudo apt-get install libgdbm-dev libncurses5-dev automake libtool bison libffi-dev -y
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -sSL https://get.rvm.io | bash -s stable
source /home/pipeline/.rvm/scripts/rvm
rvm requirements
rvm install 2.4.1
rvm use 2.4.1 --default
sudo apt-get -y install nodejs
gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay jekyll-assets uglifier octopress-minify-html
git clone "https://github.com/OpenLiberty/guides-common.git" src/main/content/guides/guides-common
git clone "https://github.com/OpenLiberty/guide-rest-intro.git" src/main/content/guides/guide_rest_intro
git clone "https://github.com/OpenLiberty/guide-maven-intro.git" src/main/content/guides/guide_maven_intro
git clone "https://github.com/OpenLiberty/guide-microprofile-intro.git" src/main/content/guides/guide_microprofile_intro
git clone "https://github.com/OpenLiberty/guide-rest-hateoas.git" src/main/content/guides/guide_rest_hateoas
git clone "https://github.com/OpenLiberty/guide-rest-client-java" src/main/content/guides/guide_rest_client-java

# Clone the circuit breaker interactive guide. 
git clone "https://github.com/OpenLiberty/iguides-common" src/main/content/guides/iguides-common
git clone "https://github.com/OpenLiberty/iguide-circuit-breaker" src/main/content/guides/iguide-circuit-breaker
# Move any js/css files from guides to the _assets folder for jekyll-assets minification.
find src/main/content/guides/iguide* -d -name js -exec cp -R '{}' src/main/content/_assets \;
find src/main/content/guides/iguide* -d -name css -exec cp -R '{}' src/main/content/_assets \;

mkdir target
mkdir target/jekyll-webapp
jekyll build --source src/main/content --destination target/jekyll-webapp
mvn -B package
