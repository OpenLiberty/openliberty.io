#!/bin/bash
# Clone the Antora playbook used for building the docs pages

# Remove the docs playbook repository
rm -rf docs-playbook

BRANCH_NAME="open-liberty-apis-prototype"
# Development environments with draft content
if [[ "$STAGING_SITE" == "true" || "$DOCS_STAGING_SITE" == "true" ]]; then
    echo "Cloning the staging branch of docs-playbook"
    BRANCH_NAME="staging"
elif [[ "$DRAFT_SITE" == "true" || "$DOCS_DRAFT_SITE" == "true" ]]; then
    echo "Cloning the draft branch of docs-playbook"
    BRANCH_NAME="draft"
elif [ "$NOT_PROD_SITE" == "true" ]; then
    echo "Not cloning any branch from docs-playbook (aka, skipping building docs-playbook, and therefore all docs)"
    exit 0
fi

echo "Cloning the $BRANCH_NAME Antora playbook branch"

git clone https://github.com/OpenLiberty/docs-playbook.git --branch $BRANCH_NAME

echo "git version"
git --version

# Move the docs playbook over to the docs dir so it can generate the doc pages
mkdir -p src/main/content/docs/
cp -f docs-playbook/antora-playbook.yml src/main/content/docs/

# Move the docs redirect file to the WEB-INF directory
if [ -f docs-playbook/doc-redirects.properties ]; then
   echo "Moving the docs redirects file"
   mv docs-playbook/doc-redirects.properties src/main/webapp/WEB-INF/doc-redirects.properties
fi