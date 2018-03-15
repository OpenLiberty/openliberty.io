#!/usr/bin/env bash
set -e

echo "============== INSTALLING CLOUD FOUNDRY CLI CLIENT =============="
# https://github.com/cloudfoundry/cli/releases
wget --max-redirect=1 --output-document=cf_cli_6.35.0.tgz "https://cli.run.pivotal.io/stable?release=linux64-binary&version=6.35.0&source=github-rel"
gunzip cf_cli_6.35.0.tgz
tar -xvf cf_cli_6.35.0.tar

echo "============== LOGGING INTO CLOUD FOUNDRY =============="
./cf login -a=$BLUEMIX_API -s=$BLUEMIX_SPACE -o=$BLUEMIX_ORGANIZATION -u=$BLUEMIX_USER -p=$BLUEMIX_PASSWORD

# grab app name from manifest.yml route
BLUE=`cat manifest.yml|grep route:|awk '{print $3}'|sed -e 's,\..*,,'`
GREEN="${BLUE}-B"
TEMP="${BLUE}-old"
echo "App name is $BLUE"

# create the GREEN application
./cf push $GREEN -p ./target/openliberty.war -b liberty-for-java -f manifest.yml

# cleanup
echo "Cleaning up after blue-green deployment..."
./cf stop $BLUE
./cf rename $BLUE $TEMP
./cf rename $GREEN $BLUE
./cf rename $TEMP $GREEN
