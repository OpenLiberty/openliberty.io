#!/usr/bin/env bash
set -e

BLUEMIX_ORG="$1"
BLUEMIX_USER="$2"
BLUEMIX_PASS="$3"

echo "============== INSTALLING CLOUD FOUNDRY CLI CLIENT =============="
# https://github.com/cloudfoundry/cli/releases
wget --max-redirect=1 --output-document=cf_cli_6.35.0.tgz "https://cli.run.pivotal.io/stable?release=linux64-binary&version=6.35.0&source=github-rel"
gunzip cf_cli_6.35.0.tgz
tar -xvf cf_cli_6.35.0.tar

echo "============== LOGGING INTO CLOUD FOUNDRY =============="
./cf login -a=$BLUEMIX_API -s=$BLUEMIX_SPACE -o=$BLUEMIX_ORG -u=$BLUEMIX_USER -p=$BLUEMIX_PASS

# ==== VARIABLE SETUP ====
APP=`echo $ROUTE | sed -e 's,\..*,,'`
echo "App name is $APP"

# ==== DEPLOYMENT ====
./cf push $APP -f ./.travis/travis_manifest.yml