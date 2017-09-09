#!/bin/bash
function pushApp {
  cf push "${CF_APP}" --no-start
  cf set-env "${CF_APP}" PAT "${PAT}"
  cf set-env myapp JBP_CONFIG_LIBERTY "app_archive: {features: [$FEATURES]}"
  if [[ -z $CURRENT_STATE ]]
  then
    cf bind-service "${CF_APP}" "${AVAILABILITY_SERVICE}"
  fi
  cf start "${CF_APP}"
  cf set-env "${CF_APP}" LAST_DEPLOY_NUMBER "${BUILD_NUMBER}"
}
