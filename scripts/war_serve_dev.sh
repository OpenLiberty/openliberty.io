#!/bin/bash

SCRIPT_DIR=$(dirname $0)

WAR=$SCRIPT_DIR/../target/openliberty.war
XML_SRC=$SCRIPT_DIR/../src/main/wlp/server.xml
SERVER_DIR=$SCRIPT_DIR/../target/liberty/wlp/usr/servers/BoostServer
APPS_DIR=$SERVER_DIR/apps/
XML_DEST=$SERVER_DIR/server.xml
KEY_JKS=$SERVER_DIR/resources/security/key.jks

source $SCRIPT_DIR/get_dhe_signer.sh

if [[ ! -f $SCRIPT_DIR/../target/openliberty.war ]]; then
  echo "The openliberty.war file does not exist in target/ - did you run scripts/build_jekyll_maven.sh ?"
  exit 1
fi

mvn boost:stop
mvn boost:start

echo "Creating server.xml"
sed -e 's/<\/server>//g' $XML_SRC > $XML_DEST
echo '<variable name="appLocation" value="openliberty.war" /><featureManager><feature>transportSecurity-1.0</feature><feature>appSecurity-2.0</feature></featureManager></server>' >> $XML_DEST


# Check if required public.dhe.ibm.com is present
wait_for_key_jks
has_dhe_cert
if [[ $HAS_CERT ]]; then
  echo "$KEY_JKS appears to be configured correctly";
else
  get_dhe_signer

  echo "Restarting the server to pickup keystore changes"
  mvn boost:stop
  mvn boost:start
fi

echo "Deploying application"
cp $WAR $APPS_DIR

echo "Website should be ready at https://localhost:9443/"

