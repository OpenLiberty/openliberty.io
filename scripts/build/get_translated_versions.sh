pushd docs-translation

git fetch --all
branches="$(git branch -r --format='%(refname:short)')"
for b in $branches; do
    if [[ "$b" == "origin/HEAD" ]]; then
        continue
    fi
    IFS=/ read -r org fold <<< "$b"
    if [[ "$fold" == "translation-source-control" ]]; then
        fold="latest"
    fi
    mkdir -p ../target/jekyll-webapp/ja/docs/$fold
    mkdir -p ../target/jekyll-webapp/zh-Hans/docs/$fold
    git checkout -f -q $b
    cp -R ja/. ../target/jekyll-webapp/ja/docs/$fold/.
    cp -R zh-Hans/. ../target/jekyll-webapp/zh-Hans/docs/$fold/.
done

popd
