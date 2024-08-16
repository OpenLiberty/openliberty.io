timer_start=$(date +%s)

pushd target/jekyll-webapp/docs/
echo "Runing gzip on all of the English docs html."
find . \( -name '*.html' -not -name "*index.html" \) -exec gzip "{}" \;
popd

pushd target/jekyll-webapp/ja/docs/
echo "Runing gzip on all of the Japanese docs html."
find . \( -name '*.html' -not -name "*index.html" \) -exec gzip "{}" \;
popd

# pushd target/jekyll-webapp/zh-Hans/docs/
# echo "Runing gzip on all of Simplified Chinese docs html."
# find . \( -name '*.html' -not -name "*index.html" \) -exec gzip "{}" \;
# popd


timer_end=$(date +%s)
echo "Total execution time for running gzip.sh: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"
