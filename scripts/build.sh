# These are steps needed when hosting the website on IBM Cloud (once known as IBM Bluemix)
#
#
sudo apt-get update
sudo apt-get install nodejs python3-bs4 libgdbm-dev libncurses5-dev automake libtool bison libffi-dev -y

gpg --keyserver hkp://pool.sks-keyservers.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
curl -sSL https://get.rvm.io | bash -s stable
source /usr/local/rvm/scripts/rvm
rvm requirements
rvm install 2.4.1
rvm use 2.4.1 --default

# Print out default locale and change it to en_US.UTF-8
echo "Default locale:"
echo `locale`
export LANG="en_US.UTF-8"

SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/build_jekyll_maven.sh
