#!/bin/bash
# Determine which branch of docs-javadoc repo to clone
timer_start=$(date +%s)

BRANCH_NAME="open-liberty-apis-prototype"
# Development environments with draft content
if [[ "$STAGING_SITE" == "true" || "$JAVADOC_STAGING_SITE" == "true" ]]; then
    echo "Cloning the staging branch of javadoc"
    BRANCH_NAME="staging"
elif [[ "$DRAFT_SITE" == "true" || "$JAVADOC_DRAFT_SITE" == "true" ]]; then
    echo "Cloning the draft branch of javadoc"
    BRANCH_NAME="draft"
elif [ "$NOT_PROD_SITE" == "true" ]; then
    echo "Not cloning any branch from javadoc (aka, skipping building javadoc, and therefore all docs)"
    exit 0
fi

echo "Cloning the $BRANCH_NAME branch of javadoc repository..."

# Clone docs-javadoc repo
pushd src/main/content
# Remove previous installations of docs-javadoc
rm -rf docs-javadoc
git clone https://github.com/OpenLiberty/docs-javadoc.git --branch $BRANCH_NAME

echo "git version"
git --version

popd

timer_end=$(date +%s)
echo "Total execution time for cloning javadocs: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"