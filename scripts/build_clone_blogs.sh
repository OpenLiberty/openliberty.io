pushd src/main/content

# For development purposes, lets always delete previously created folders
# so that you can run this script to refresh your blog files
rm -rf _posts _drafts

echo "Start cloning blogs repository..."

git clone https://github.com/OpenLiberty/blogs.git --branch master blogs_temp

mv blogs_temp/drafts/ .
mv drafts/ _drafts
mv blogs_temp/publish/ .
mv publish/ _posts

rm -rf blogs_temp
popd
echo "Done cloning blogs repository!"