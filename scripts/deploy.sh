#!/bin/bash
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/deploy_function.sh

APPS="$(cf apps | grep openliberty- || true)"
echo "$APPS"
STARTEDCOUNT=$(echo "$APPS" | (grep started || true) | wc -l)
echo "$STARTEDCOUNT"
STOPPEDCOUNT=$(echo "$APPS" | (grep stopped || true) | wc -l)
echo "$STOPPEDCOUNT"
CURRENT_STATE=$(echo "$APPS" | (grep $CF_APP || true) | awk '{print $2'})
echo "$CURRENT_STATE"

if [[ -z $CURRENT_STATE || $CURRENT_STATE = stopped || $STARTEDCOUNT = 2 || $STOPPEDCOUNT = 2 ]]
then
  echo "pushing app"
  pushApp
else
  echo "not pushing app"
fi
