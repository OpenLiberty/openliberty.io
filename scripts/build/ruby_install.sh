# Import the signing keys used for rvm to gpg for verification
timer_start=$(date +%s)

echo "Install Ruby & required packages/gems"
cat $BUILD_SCRIPTS_DIR/../gpg/mpapis.asc | gpg --import -
cat $BUILD_SCRIPTS_DIR/../gpg/pkuczynski.asc | gpg --import -

curl -sSL https://get.rvm.io | bash -s stable
set +e
source /usr/local/rvm/scripts/rvm || true
set -e

rvm requirements
rvm install 2.5.7
rvm use 2.5.7 --default
echo "Ruby version:"
echo `ruby -v`

gem install jekyll -v 3.8.6
gem install jekyll-assets -v 2.4.0
gem install bundler jekyll-feed jekyll-asciidoc jekyll-include-cache coderay uglifier octokit

timer_end=$(date +%s)
echo "Total execution time for installing Ruby and required packages/gems: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"