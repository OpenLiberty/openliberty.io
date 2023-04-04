[![Twitter Follow](https://img.shields.io/twitter/follow/OpenLibertyIO?style=social)](https://twitter.com/OpenLibertyIO)
[![Stack Overflow Badge](https://img.shields.io/badge/-Ask%20on%20Stack%20Overflow-F58025?logo=stackoverflow&logoColor=fff&style=flat)](https://stackoverflow.com/questions/tagged/open-liberty)
[![Gitter badge](https://img.shields.io/badge/-Chat%20on%20Gitter-E43262?logo=gitter)](https://app.gitter.im/#/room/#OpenLiberty_development:gitter.im)
[![Groups.io badge](https://img.shields.io/badge/-Chat%20on%20Groups.io-informational)](https://groups.io/g/openliberty)
---
---

![Open Liberty logo](https://raw.githubusercontent.com/OpenLiberty/logos/main/combomark/png/OL_logo_green_on_white.png)

# Introduction
[Openliberty.io](https://openliberty.io) is a Open Liberty web application  running as a container on [IBM Cloud Code Engine](https://www.ibm.com/cloud/code-engine). The website is a [Jekyll](https://jekyllrb.com/) based templates with [Asciidoctor](http://asciidoctor.org/) support. New content, such as blog posts and guides, can be easily added in HTML, Markdown or AsciiDoc format. Build process integration provides access to the latest releases and development builds for Open Liberty as well as developer tools. Built-in GitHub integration allows browsing open issues from within the site. A continuous delivery process using [IBM Cloud Continuous Delivery](https://www.ibm.com/cloud/continuous-delivery) makes it possible to update the website by pushing changes to the repository.

## Contributing to the blog
Head over to the GitHub [OpenLiberty/blogs](https://github.com/OpenLiberty/blogs) repository to find out how to contribute a blog post to [openliberty.io/blogs/](https://openliberty.io/blogs/).

## Contributing to the guides
Each guide resides in its own GitHub repository and is dynamically pulled into the [openliberty.io](https://openliberty.io) build process through the [`scripts/clone_guides.rb`](https://github.com/OpenLiberty/openliberty.io/blob/prod/scripts/build/clone_guides.rb) script.

Head over to the GitHub [OpenLiberty/draft-guides-template](https://github.com/OpenLiberty/draft-guides-template) repository to find out how to contribute a new guide to [openliberty.io/guides/](https://openliberty.io/guides/).
