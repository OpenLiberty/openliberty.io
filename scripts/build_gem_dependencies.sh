echo "Installing ruby packages..."
gem install jekyll -v 3.8.6
gem install bundler -v 1.17.3 # Upgrading to 2.1.0 breaks the build
gem install jekyll-feed jekyll-asciidoc coderay uglifier octopress-minify-html octokit
gem install jekyll-assets -v 2.4.0