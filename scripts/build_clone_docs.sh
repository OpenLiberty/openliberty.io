# Clone the docs (draft or published)
#
# git clone does not like to clone into folders that are populated.  We are doing
# this sequence of commands to workaround that limitation. 
# Could _not_ use:
#   git clone https://github.com/OpenLiberty/docs.git --branch develop src/main/content

branch_name="$1"

pushd src/main/content
echo "Start cloning docs repository..."
mkdir docs
cd docs

# This is how you clone a repo without autocreating a parent folder with the name of the repo
# The clone is picky about cloning into a folder that is not empty (src/main/content)
git clone https://github.com/OpenLiberty/docs.git --branch $branch_name .
popd
echo "Done cloning docs repository!"