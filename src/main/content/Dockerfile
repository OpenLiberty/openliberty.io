# Created by laura_cowen@uk.ibm.com
# 2017-11-02
# Installing and running Jekyll based on: based on https://blog.codeship.com/a-beginners-guide-to-the-dockerfile/
# NodeJS and NPM sections based on: https://gist.github.com/remarkablemark/aacf14c29b3f01d6900d13137b21db3a

# The purpose of this dockerfile is to run your Jekyll website so you don't have to install Jekyll 
# and all of Jekyll's pre-requisite software.
# You can view the site in a browser on your local (host) machine (at http://0.0.0.0:4000).
# You can then modify website source files on your local (host) machine.
# When you save a changed file, the changes are automatically rebuilt by Jekyll in the container and you can almost immediately
# see the changes when you refresh your browser.

# To build this image:
# docker build --tag jekyll .
#
# To run a container:
# docker run --name jekyll_site -it -d -p 4000:4000 -v <root directory of Jekyll site on host machine>:/home/jekyll jekyll



# Use the official Ruby image as a parent image
FROM ruby:latest


# INSTALL NODEJS AND NPM (it's a dependency of something in the Jekyll setup)

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


# INSTALLING AND RUNNING JEKYLL

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


