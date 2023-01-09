pushd src/main/content

# For development purposes, lets always delete previously created folders
# so that you can run this script to refresh your blog files
rm -rf _posts
rm -rf _drafts
rm -rf _i18n/en/_posts _i18n/ja/_posts _i18n/zh-Hans/_posts
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

git clone https://github.com/OpenLiberty/blogs.git --branch "ja-instanton" blogs_temp

# This section is moving the blog posts around for the Jekyll build process
mv blogs_temp/posts/ .
mv posts/ _posts
## Separate the blog posts into their respective language folder for the 
## `jekyll-multiple-languages-plugin` Jekyll plugin
# Japanese
mv _posts/ja _i18n/ja/_posts
rm -rf _posts/ja

# Simplified Chinese
mv _posts/zh-Hans _i18n/zh-Hans/_posts
rm -rf _posts/zh-Hans

# English
cp -a _posts/. _i18n/en/_posts

mv blogs_temp/img/blog img

mv blogs_temp/blog_tags.json .

# Move the blog redirect file to the WEB-INF directory
if [ -f blogs_temp/blog-redirects.properties ]; then
   echo "Moving the blog redirects file"
   mv blogs_temp/blog-redirects.properties ../webapp/WEB-INF/blog-redirects.properties
fi

rm -rf blogs_temp
popd
echo "Done cloning blogs repository!"