pushd docs-translation

git fetch --all
git fetch --all --tags --prune
tags="$(git tag)"
for t in $tags; do
    fold=${t%-*:1}
    mkdir -p ../target/jekyll-webapp/ja/docs/$fold
    mkdir -p ../target/jekyll-webapp/zh-Hans/docs/$fold
    git checkout -f -q $t
    cp -R ja/. ../target/jekyll-webapp/ja/docs/$fold/.
    cp -R zh-Hans/. ../target/jekyll-webapp/zh-Hans/docs/$fold/.
done

popd
