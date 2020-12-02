# Clone the Antora playbook used for building the docs pages

# Remove the docs playbook repository
rm -rf docs-playbook

BRANCH_NAME="prod"
if [ "$ROUTE" ]; then
    if [ "$STAGING_SITE" == "true" ]; then
        BRANCH_NAME="staging"
    elif [ "$DRAFT_SITE" == "true" ]; then
        BRANCH_NAME="draft"
    fi
fi

echo "Cloning the $BRANCH_NAME Antora playbook branch"

git clone https://github.com/OpenLiberty/docs-playbook.git --branch $BRANCH_NAME

# Move the docs playbook over to the docs dir so it can generate the doc pages
mkdir -p src/main/content/docs/
cp -f docs-playbook/antora-playbook.yml src/main/content/docs/