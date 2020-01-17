# These are steps needed when hosting the website on IBM Cloud (once known as IBM Bluemix)
#
#
sudo apt-get update
sudo apt-get update maven
sudo apt-get install libgdbm-dev libncurses5-dev automake libtool bison libffi-dev -y
sudo apt-get install python3-bs4 -y
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
source $SCRIPT_DIR/build_jekyll_maven.sh