echo "Installing ruby packages..."
gem install jekyll -v 3.8.6
gem install bundler jekyll-feed jekyll-asciidoc jekyll-include-cache coderay uglifier octopress-minify-html octokit
gem install jekyll-assets -v 2.4.0
gem uninstall -i /usr/local/rvm/gems/ruby-2.4.1@global rubygems-bundler
