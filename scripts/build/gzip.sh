timer_start=$(date +%s)

pushd target/jekyll-webapp/docs/
echo "Runing gzip on all of the docs html."
find . \( -name '*.html' -not -name "*index.html" \) -exec gzip "{}" \;
popd

timer_end=$(date +%s)
echo "Total execution time for running gzip.sh: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"