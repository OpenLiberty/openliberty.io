#!/bin/bash
set -e
export BUILD_SCRIPTS_DIR=$(dirname $0)

timer_start=$(date +%s)
python3 $BUILD_SCRIPTS_DIR/parse_features_toc.py
timer_end=$(date +%s)
echo "Total execution time for parsing the features toc: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"

# Javadoc Portion of Docs
echo "Begin building javadoc content"
$BUILD_SCRIPTS_DIR/javadoc_clone.sh

# Special handling for javadocs
$BUILD_SCRIPTS_DIR/javadoc_modify.sh

echo "Finished building Javadoc content"

echo "Finished building all doc content"