# Import the signing keys used for rvm to gpg for verification
timer_start=$(date +%s)

echo "Install Ruby & required packages/gems"
sudo apt-get -y install gnupg build-essential

cat $BUILD_SCRIPTS_DIR/../gpg/mpapis.asc | gpg --import -
cat $BUILD_SCRIPTS_DIR/../gpg/pkuczynski.asc | gpg --import -

# calls to https://get.rvm.io via curl started causing CA errors, but that call would just redirect to github, 
# which uses different CA (digicert vs let's encrypt).  This will work for as long as rvm doesn't move from 
# github to another host for this file.  If that happens, try going back to rvm.io or directly to 
# w/e new thing they choose to redirect to instead

curl -v -sSL https://raw.githubusercontent.com/rvm/rvm/master/binscripts/rvm-installer | bash -s stable

set +e
source /usr/local/rvm/scripts/rvm || true
set -e

rvm requirements
rvm install 2.7.6
rvm use 2.7.6 --default
echo "Ruby version:"
echo `ruby -v`

gem install jekyll -v 3.8.6
gem install jekyll-assets -v 2.4.0
gem install bundler jekyll-feed jekyll-asciidoc jekyll-include-cache coderay octokit

timer_end=$(date +%s)
echo "Total execution time for installing Ruby and required packages/gems: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"
