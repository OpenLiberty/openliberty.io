echo "Installing ruby packages..."
gem install ffi -v 1.16.3
gem install public_suffix -v 5.1.1
gem install jekyll -v 3.8.6
gem install jekyll-assets -v 2.4.0
gem install jekyll-multiple-languages-plugin
gem install bundler -v 2.4.22
gem install faraday -v 2.8.1
gem install faraday-net_http -v 3.0.2
gem install jekyll-feed jekyll-asciidoc jekyll-include-cache coderay octokit
gem uninstall -i /usr/local/rvm/gems/ruby-2.4.1@global rubygems-bundler
