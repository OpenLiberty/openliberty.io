# These are steps needed when hosting the website on IBM Cloud (once known as IBM Bluemix)

timer_start=$(date +%s)
echo "Update packages & prep environment"
if [ "$LOCAL_BUILD" = false ]; then
sudo apt-get update
sudo apt-get install nodejs python3-bs4 libgdbm-dev libncurses5-dev automake libtool bison libffi-dev python3-lxml -y
fi

export BUILD_SCRIPTS_DIR=$(dirname $0)

# Print out default locale and change it to en_US.UTF-8
echo "Default locale:"
echo `locale`
export LANG="en_US.UTF-8"

timer_end=$(date +%s)
echo "Total execution time for installing updating packages and preping env: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"

#Build all site content that's build using Jekyll (aka, everything but docs, which uses Antora)
timer_start=$(date +%s)
source $BUILD_SCRIPTS_DIR/jekyll.sh
timer_end=$(date +%s)
echo "Total execution time for running jekyll.sh build: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"

# Build Docs portion of site (uses Antora)
timer_start=$(date +%s)
ls
source $BUILD_SCRIPTS_DIR/docs_part_1.sh
source $BUILD_SCRIPTS_DIR/docs_part_2.sh
timer_end=$(date +%s)
echo "Total execution time for running antora.sh build: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"

# remove unnecessary folders
rm -rf target/jekyll-webapp/docs/*/reference/feature/*/
rm -rf target/jekyll-webapp/guides/guide-*/

# Run Gzip for compression of html,js,css
source $BUILD_SCRIPTS_DIR/gzip.sh

# Maven packaging
# A Maven wrapper is used to set our own Maven version independent of the build environment and is specified in ./mvn/wrapper/maven-wrapper.properties
# Set the TLS Protocol to 1.2 for the maven wrapper on Java version 1.7
timer_start=$(date +%s)
echo "Running maven (mvn)..."
./mvnw -B -Dhttps.protocols=TLSv1.2 package
timer_end=$(date +%s)
echo "Total execution time for running antora.sh build: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"