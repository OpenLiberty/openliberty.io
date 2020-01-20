# These are steps needed when hosting the website on IBM Cloud (once known as IBM Bluemix)
#
#
sudo apt-get update
sudo apt-get install libgdbm-dev libncurses5-dev automake libtool bison libffi-dev -y
sudo apt-get install python3-bs4 -y
# Update maven
# pushd /opt/IBM/
# sudo wget http://www-eu.apache.org/dist/maven/maven-3/3.3.9/binaries/apache-maven-3.3.9-bin.tar.gz
# echo "List contents 1:"
# ls -l
# sudo tar -xvzf apache-maven-3.3.9-bin.tar.gz
# echo "List contents 2 after tar:"
# ls -l
# sudo mv apache-maven-3.3.9 maven
# echo "List the maven versions in dir:"
# ls maven
# popd
# export PATH=/opt/IBM/maven/apache-maven-3.3.9/bin:$PATH
# echo "Maven version:"
# mvn -v
# End update maven

gpg --keyserver hkp://pool.sks-keyservers.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
curl -sSL https://get.rvm.io | bash -s stable
source /home/pipeline/.rvm/scripts/rvm
rvm requirements
rvm install 2.4.1
rvm use 2.4.1 --default
sudo apt-get -y install nodejs

# Print out default locale and change it to en_US.UTF-8
echo "Default locale:"
echo `locale`
export LANG="en_US.UTF-8"

SCRIPT_DIR=$(dirname $0)

echo "Copy project's Maven settings.xml into m2 settings"
cp settings.xml ${HOME}/.m2/settings.xml 2>/dev/null

source $SCRIPT_DIR/build_jekyll_maven.sh