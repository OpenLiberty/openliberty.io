pushd src/main/content

# For development purposes, lets always delete previously created folders
# so that you can run this script to refresh your blog files
rm -rf _posts _drafts
rm -rf img/blog

echo "Start cloning blogs repository..."

BRANCH_NAME="prod"
# Development environments with draft docs/guides
if [ "$JEKYLL_STAGING_BLOGS" == "true" ]; then
    echo "Cloning the staging branch of blogs"
    BRANCH_NAME="staging"
elif [ "$JEKYLL_DRAFT_BLOGS" == "true" ]; then
    echo "Cloning the draft branch of blogs"
    BRANCH_NAME="draft"
else
    echo "Cloning the prod branch of blogs"
fi

git clone https://github.com/OpenLiberty/blogs.git --branch $BRANCH_NAME blogs_temp

mv blogs_temp/posts/ .
mv posts/ _posts

mv blogs_temp/img/blog img

mv blogs_temp/blog_tags.json .

rm -rf blogs_temp
popd
echo "Done cloning blogs repository!"