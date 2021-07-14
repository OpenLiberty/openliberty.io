#!/bin/bash
function pushApp {
  mkdir -p server_directory/apps/
  cp target/openliberty.war server_directory/apps/

  cp target/openliberty.war server_directory/apps/
  cf push "${CF_APP}" --no-start -p server_directory
  cf set-env "${CF_APP}" PAT "${PAT}"
  if [[ -z $CURRENT_STATE ]]
  then
    cf bind-service "${CF_APP}" "${AVAILABILITY_SERVICE}"
  fi
  cf start "${CF_APP}"
  cf set-env "${CF_APP}" LAST_DEPLOY_NUMBER "${BUILD_NUMBER}"
  #cf map-route "${CF_APP}" mybluemix.net --hostname "${CF_APP}"
}
