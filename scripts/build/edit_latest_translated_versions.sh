pushd docs-translation

ls
git fetch --all
git fetch --all --tags --prune
tags="$(git tag)"
for t in $tags; do
        fold=${t%-*}
        fold="${fold:1}"
        last=$fold
done
echo $last
mv ../target/jekyll-webapp/zh-Hans/docs/$last ../target/jekyll-webapp/zh-Hans/docs/latest
mv ../target/jekyll-webapp/ja/docs/$last ../target/jekyll-webapp/ja/docs/latest
popd