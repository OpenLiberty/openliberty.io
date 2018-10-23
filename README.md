![](src/main/content/img/logo.png)

# Introduction
Openliberty.io is a portable, mobile enabled web application hosted on [IBM Cloud](https://console.bluemix.net/). It features [Jekyll](https://jekyllrb.com/) based templates with [Asciidoctor](http://asciidoctor.org/) support. New content, such as blog posts and guides, can be easily added in HTML, markdown or AsciiDoc format. Build process integration provides access to the latest releases and development builds for Open Liberty as well as Eclipse tools. Built-in gitHub integration allows browsing open issues from within the site. A continuous delivery process using [IBM Cloud DevOps Toolchains](https://www.ibm.com/devops/method/category/tools/) makes it possible to instantly update the application by pushing changes to the repository. 

## Portability
The graphical user interface is built to work consistently across all major web browsers, including Chrome, Edge, Internet Explorer, Firefox and Safari.

## Responsive design
The [jQuery](https://jquery.com/) and [Bootstrap](http://getbootstrap.com/) frameworks are leveraged to provide a seamless experience in desktops, laptops, tablets, and smart phones.

## Contributing to the blog
Create a pull request with the content of the blog post placed in the `src/main/content/_posts/` folder using the following file naming scheme: `YYYY-MM-DD-post-title.extension`. HTML, markdown, and AsciiDoc formats can be used. The file extension would be .html, .md, or .adoc respectively. In the blog post file the following front matter variables must be set:
- layout: post
- categories: blog
- title: `title of the blog post`
- date: `date in YYYY-MM-DD HH:MM:SS +/-TTTT format`
- author_picture: `secure url to author picture`

## Contributing to the guides
Each guide resides in its own repository and is dynamically pulled into the openliberty.io build process through the `scripts/build.sh` shell script. The content of the guide can be written in HTML, markdown, or AsciiDoc formats. The following front matter variables must be set:
- layout: guide
- duration: `time required to complete the guide`
- description: `one line description of the guide`
- tags: `(optional) array of tags associated with the guide`
- permalink: `relative url where the guide will be published`

## Community
- [Open Liberty group.io](https://groups.io/g/openliberty)
- [OpenLibertyIO on Twitter](https://twitter.com/OpenLibertyIO)
- [was-liberty tag on stackoverflow](https://stackoverflow.com/questions/tagged/websphere-liberty)

