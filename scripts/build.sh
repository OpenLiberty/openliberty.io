sudo apt-get update
sudo apt-get install curl
curl -sSL https://get.rvm.io | bash -s stable
source /home/pipeline/.rvm/scripts/rvm
rvm requirements
rvm install 2.4.1
rvm use 2.4.1 --default
sudo apt-get -y install nodejs
gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay
export JEKYLL_ENV=production
git clone "https://gindik:$PAT@github.com/OpenLiberty/guides-common.git" src/main/content/guides/guides-common
git clone "https://gindik:$PAT@github.com/OpenLiberty/guide-rest-intro.git" src/main/content/guides/guide_rest_intro
git clone "https://gindik:$PAT@github.com/OpenLiberty/guide-maven.git" src/main/content/guides/guide_maven
jekyll build --source src/main/content --destination src/main/webapp
mvn -B package
