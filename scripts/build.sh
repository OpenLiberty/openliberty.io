# These are steps needed when hosting the website on IBM Cloud (once known as IBM Bluemix)
#
#
sudo apt-get update
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

echo "List contents:"
ls -a ${HOME}
echo "Copy project's Maven settings.xml into m2 settings"
mkdir ${HOME}/.m2
cp settings.xml ${HOME}/.m2/settings.xml 2>/dev/null || :
if [[ $? -eq 0 ]]; then
    echo "Copied settings.xml to Maven dir";
else
    echo "Unable to copy settings.xml to Maven dir";
fi
echo "m2 contents:"
ls -a ${HOME}/.m2

# Print out Java version
echo "Java version:"
java -version

source $SCRIPT_DIR/build_jekyll_maven.sh