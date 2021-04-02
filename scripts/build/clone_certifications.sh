# Clone the certifications
#
# git clone does not like to clone into folders that are populated.  We are doing
# this sequence of commands to workaround that limitation. 
# Could _not_ use:
#   git clone https://github.com/OpenLiberty/certifications.git --branch dev src/main/content

pushd src/main/content

# Remove the folder to allow this repeating execution of this script
rm -rf certifications

BRANCH_NAME="prod"
# Development environments with draft content
if [[ "$STAGING_SITE" == "true" || "$CERTS_STAGING_SITE" == "true" ]]; then
    echo "Cloning the staging branch of certifications"
    BRANCH_NAME="staging"
elif [[ "$DRAFT_SITE" == "true" || "$CERTS_DRAFT_SITE" == "true" ]]; then
    echo "Cloning the draft branch of certifications"
    BRANCH_NAME="draft"
elif [ "$NOT_PROD_SITE" == "true" ]; then
    echo "Not cloning any branch from certifications (aka, skipping building certifications)"
    exit 0
fi

echo "Cloning the $BRANCH_NAME branch of certifications repository..."

mkdir certifications
cd certifications

# This is how you clone a repo without autocreating a parent folder with the name of the repo
# The clone is picky about cloning into a folder that is not empty (src/main/content)
git clone https://github.com/OpenLiberty/certifications.git --branch $BRANCH_NAME .

# Move the blog redirect file to the WEB-INF directory
if [ -f certifications/cert-redirects.properties ]; then
   echo "Moving the certifications redirects file"
   mv certifications/cert-redirects.properties src/main/webapp/WEB-INF/cert-redirects.properties
fi

popd
echo "Done cloning certifications repository!"