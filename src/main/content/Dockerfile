# Created by laura_cowen@uk.ibm.com based on https://blog.codeship.com/a-beginners-guide-to-the-dockerfile/
# 2017-11-02

# Use the official Ruby image as a parent image
FROM ruby:latest


# Install npm and NodeJS

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 9.0.0

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# confirm installation
RUN node -v
RUN npm -v



# create a user and group for Jekyll, set appropriate permissions, install the Jekyll gem
RUN mkdir -p /home/jekyll \
    && groupadd -rg 1000 jekyll \
    && useradd -rg jekyll -u 1000 -d /home/jekyll jekyll \
    && chown jekyll:jekyll /home/jekyll \
    && gem install jekyll bundler jekyll-feed jekyll-asciidoc coderay jekyll-assets uglifier octopress-minify-html


# Create a mount point where Docker can access the source files on my local system (host system)
VOLUME /home/jekyll

#  Set the working directory
WORKDIR /home/jekyll

# Serve the site
ENTRYPOINT ["jekyll", "serve", "--host=0.0.0.0"]

# Make port 4000 available to the world outside this container
EXPOSE 4000









# To build this image:
# docker build --tag jekyll .


# To run a container:
# docker run --name jekyll_laura -it -d -p 4000:4000 -v /Users/laura/github/openliberty/openliberty.io/src/main/content:/home/jekyll jekyll

