#!/bin/bash
set +e
source /usr/local/rvm/scripts/rvm || true
set -e

rvm requirements
rvm install 2.6.6
rvm use 2.6.6 --default
echo "Ruby version:"
echo `ruby -v`

jekyll s --host 0.0.0.0 --future --source src/main/content --config src/main/content/_config.yml,src/main/content/_dev_config.yml --drafts
