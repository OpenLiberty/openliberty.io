# Setting up environment for writing DRAFT blog posts

## You will need the following tools installed on your system
- ruby
- gem

## Clone the website code
1. `git clone git@github.com:OpenLiberty/openliberty.io.git`
2. `cd openliberty.io`

## Install ruby libraries used by the website by running two `gem` commands to install these libraries

1. `gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay uglifier octopress-minify-html octokit`
2. `gem install jekyll-assets -v 2.4.0`


> **Note**: You can find these two commands in the build scripts here:
    https://github.com/OpenLiberty/openliberty.io/blob/6d643218e67c1cdf610931964818d431c0c248a2/scripts/build_jekyll_maven.sh#L11
    https://github.com/OpenLiberty/openliberty.io/blob/6d643218e67c1cdf610931964818d431c0c248a2/scripts/build_jekyll_maven.sh#L12

## (Optional) Turn off JavaScript/CSS/HTML minification for performance

In `openliberty.io/src/main/content/_config.yml` set these values to false, `css`, `js`, `minify_html`.  The result should look like

```
assets:
  compress:
    css: false
    js: false

env: production
minify_html: false
```

Run the Jekyll server locally
- `cd src/main/content`
- `jekyll s --drafts`
    > The `--drafts` flag is to include the `*.adoc` files in the `_drafts` folder. 
- Go to http://localhost:4000/blog/

# While the Jekyll server is running...
You can make changes to your `*.adoc`. When you make changes, monitor your terminal for messages saying 
`Regenerating: 1 file(s) changed at 2018-03-16 12:04:56 ...done in 13.638151 seconds.`


# Example of starting Jekyll and making an `*.adoc` change
```
kueng@Kins-MacBook-Pro ~/work/sandboxes/openliberty.io/src/main/content  (blogSpacingAltText)# jekyll s --drafts
Configuration file: /Users/kueng/work/sandboxes/openliberty.io/src/main/content/_config.yml
            Source: /Users/kueng/work/sandboxes/openliberty.io/src/main/content
       Destination: /Users/kueng/work/sandboxes/openliberty.io/src/main/content/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
                    done in 23.506 seconds.
 Auto-regeneration: enabled for '/Users/kueng/work/sandboxes/openliberty.io/src/main/content'
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
      Regenerating: 1 file(s) changed at 2018-03-16 12:04:56
      ```
