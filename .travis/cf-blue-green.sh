#!/usr/bin/env bash
set -e

echo "============== INSTALLING CLOUD FOUNDRY CLI CLIENT =============="
# https://github.com/cloudfoundry/cli/releases
wget --max-redirect=1 --output-document=cf_cli_6.35.0.tgz "https://cli.run.pivotal.io/stable?release=linux64-binary&version=6.35.0&source=github-rel"
gunzip cf_cli_6.35.0.tgz
tar -xvf cf_cli_6.35.0.tar

echo "============== LOGGING INTO CLOUD FOUNDRY =============="
./cf login -a=$BLUEMIX_API -s=$BLUEMIX_SPACE -o=$BLUEMIX_ORGANIZATION -u=$BLUEMIX_USER -p=$BLUEMIX_PASSWORD

# ==== VARIABLE SETUP ====
# ROUTE should be set in TravisCI repo
BLUE=`echo $ROUTE | sed -e 's,\..*,,'`
echo "App name is $BLUE"

GREEN="${BLUE}-B"
TEMP="${BLUE}-old"

DOMAIN=`echo $ROUTE | sed -e "s,$BLUE\.,,"`

# ==== DEPLOYMENT ====
# create the GREEN application
./cf push $GREEN -f ./.travis/travis_manifest.yml

# ensure it starts
echo "Checking status of new instance https://${GREEN}.${DOMAIN}..."
curl --fail -s -I "https://${GREEN}.${DOMAIN}" --connect-timeout 240 --max-time 1200

# add the GREEN application to each BLUE route to be load-balanced
echo "Adding main route ($BLUE.$ROUTE) to new app ($GREEN)..."
./cf map-route $GREEN $DOMAIN --hostname $BLUE

# cleanup
echo "Cleaning up after blue-green deployment..."
./cf stop $BLUE
./cf unmap-route $GREEN $DOMAIN --hostname $GREEN # remove B route from new deploy

# setup old BLUE deploy to be ready to be GREEN for next deployment
./cf map-route $BLUE $DOMAIN --hostname $GREEN # add B route from old deploy
./cf unmap-route $BLUE $DOMAIN --hostname $BLUE # remove main route from old deploy
# this unmap may not be necessary, but keeps bluemix dashboard cleaner

# swap app names
./cf rename $BLUE $TEMP
./cf rename $GREEN $BLUE
./cf rename $TEMP $GREEN