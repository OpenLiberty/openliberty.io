pushd src/main/content
echo "Start cloning blogs repository..."

git clone https://github.com/OpenLiberty/blogs.git --branch migration blogs_temp

mv blogs_temp/_drafts/ .
mv blogs_temp/_posts/ .

rm -rf blogs_temp
popd
echo "Done cloning blogs repository!"