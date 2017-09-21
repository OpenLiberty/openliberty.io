sudo apt-get update
sudo apt-get install libgdbm-dev libncurses5-dev automake libtool bison libffi-dev -y
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -sSL https://get.rvm.io | bash -s stable
source /home/pipeline/.rvm/scripts/rvm
rvm requirements
rvm install 2.4.1
rvm use 2.4.1 --default
sudo apt-get -y install nodejs
gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay
git clone "https://contbld:$PAT@github.com/OpenLiberty/guides-common.git" src/main/content/guides/guides-common
git clone "https://contbld:$PAT@github.com/OpenLiberty/guide-rest-intro.git" src/main/content/guides/guide_rest_intro
git clone "https://contbld:$PAT@github.com/OpenLiberty/guide-maven-intro.git" src/main/content/guides/guide_maven_intro
git clone "https://contbld:$PAT@github.com/OpenLiberty/guide-microprofile-intro.git" src/main/content/guides/guide_microprofile_intro
git clone "https://contbld:$PAT@github.com/OpenLiberty/guide-rest-hateoas.git" src/main/content/guides/guide_rest_hateoas
mkdir target
mkdir target/jekyll-webapp
jekyll build --source src/main/content --destination target/jekyll-webapp
mvn -B package
