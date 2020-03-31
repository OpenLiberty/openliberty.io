# These are steps needed when hosting the website on IBM Cloud (once known as IBM Bluemix)
#
#
sudo apt-get update
sudo apt-get install nodejs python3-bs4 libgdbm-dev libncurses5-dev automake libtool bison libffi-dev -y

SCRIPT_DIR=$(dirname $0)

# Import the signing keys used for rvm to gpg for verification
cat $SCRIPT_DIR/gpg/mpapis.asc | gpg --import -
cat $SCRIPT_DIR/gpg/pkuczynski.asc | gpg --import -

curl -sSL https://get.rvm.io | bash -s stable
source /usr/local/rvm/scripts/rvm
rvm requirements
rvm install 2.4.1
rvm use 2.4.1 --default

# Print out default locale and change it to en_US.UTF-8
echo "Default locale:"
echo `locale`
export LANG="en_US.UTF-8"


source $SCRIPT_DIR/build_jekyll_maven.sh
