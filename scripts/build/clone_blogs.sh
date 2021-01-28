pushd src/main/content

# For development purposes, lets always delete previously created folders
# so that you can run this script to refresh your blog files
rm -rf _posts _drafts
rm -rf img/blog

echo "Start cloning blogs repository..."

BRANCH_NAME="prod"
# Development environments with draft docs/guides
if [[ "$STAGING_SITE" == "true" || "$BLOGS_STAGING_SITE" == "true" ]]; then
    echo "Cloning the staging branch of blogs"
    BRANCH_NAME="staging"
elif [[ "$DRAFT_SITE" == "true" || "$BLOGS_DRAFT_SITE" == "true" ]]; then
    echo "Cloning the draft branch of blogs"
    BRANCH_NAME="draft"
elif [ "$NOT_PROD_SITE" == "true" ]; then
    echo "Not cloning any branch from blogs (aka, skipping building blogs)"
    exit 0
fi

echo "Cloning the $BRANCH_NAME branch of blogs repository..."

git clone https://github.com/OpenLiberty/blogs.git --branch $BRANCH_NAME blogs_temp

mv blogs_temp/posts/ .
mv posts/ _posts

mv blogs_temp/img/blog img

mv blogs_temp/blog_tags.json .

# Move the blog redirect file to the WEB-INF directory
if [ -f blogs_temp/blog-redirects.properties ]; then
   echo "Moving the blog redirects file"
   mv blogs_temp/blog-redirects.properties /WEB-INF/blog-redirects.properties
fi

rm -rf blogs_temp
popd
echo "Done cloning blogs repository!"