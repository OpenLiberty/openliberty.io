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
if [ "$STAGING_SITE" == "true" ]; then
    echo "Cloning the staging branch of certifications"
    BRANCH_NAME="staging"
elif [ "$DRAFT_SITE" == "true" ]; then
    echo "Cloning the draft branch of certifications"
    BRANCH_NAME="draft"
else
    echo "Cloning the prod branch of certifications"
fi

echo "Start cloning certifications repository..."
mkdir certifications
cd certifications

# This is how you clone a repo without autocreating a parent folder with the name of the repo
# The clone is picky about cloning into a folder that is not empty (src/main/content)
git clone https://github.com/OpenLiberty/certifications.git --branch $BRANCH_NAME .
popd
echo "Done cloning certifications repository!"