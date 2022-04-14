#
#
# One major factor for using Ubuntu 18.04 LTS is to stay on an older Python 3.6 until the python
# scripts are migrated to use a higher version
FROM ubuntu:18.04 as ruby
SHELL ["/bin/bash", "-c"]

COPY scripts /scripts

RUN apt-get update && \
    apt-get -y install curl gnupg build-essential ruby-full git python3 python3-bs4 python3-lxml \
    nodejs libgdbm-dev libncurses5-dev automake libtool bison libffi-dev 

ENV BUILD_SCRIPTS_DIR /scripts/build
RUN scripts/build/ruby_install.sh

RUN echo "Install Node"

# Cannot find a way to set the NODE_VERSION based on the version installed by `nvm install --lts`
ENV NODE_VERSION="v16.13.2"
ENV NVM_DIR=/root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN . "$NVM_DIR/nvm.sh" && nvm install --lts
RUN . "$NVM_DIR/nvm.sh" && node --version
RUN . "$NVM_DIR/nvm.sh" && npm --version
ENV PATH="/root/.nvm/versions/node/${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

RUN echo "Install Antora"
RUN npm i -g @antora/cli@3.0.1

#
#
#
FROM ruby as jekyll
COPY gems /gems
COPY robots.txt /
COPY src /src
COPY scripts /scripts

RUN echo "Building the Antora"

# add noindex metdata for non-prod/prod sites
COPY src/main/content/_includes/noindex.html src/main/content/antora_ui/src/partials/noindex.hbs

# Build the Antora UI look and feel (based on antora-ui-default)
RUN pushd src/main/content/antora_ui && \
    echo "Installing Antora dependencies" && \
    rm -rf node_modules && \
    npm install -g @antora/site-generator@3.0.1 && \
    npm install gulp -g --ignore-scripts && \
    npm install node-sass gulp-sass --save-dev && \
    npm install && \
    gulp sass:convert && \
    SOURCEMAPS=true gulp build && \
    gulp bundle:pack && \
    popd

ENV BUILD_SCRIPTS_DIR /scripts/build

ENV DRAFT_SITE=true
RUN ./scripts/build/jekyll.sh

#
#
#
FROM jekyll as javadocs

ENV BUILD_SCRIPTS_DIR /scripts/build
ENV STAGING_SITE true

RUN $BUILD_SCRIPTS_DIR/javadoc_clone.sh

#
#
#
FROM javadocs as docs1

ENV BUILD_SCRIPTS_DIR /scripts/build
ENV STAGING_SITE true

RUN $BUILD_SCRIPTS_DIR/docs_part_1.sh

#
#
#
FROM docs1 as docs2

RUN timer_start=$(date +%s) && \
    python3 $BUILD_SCRIPTS_DIR/parse_features_toc.py && \
    timer_end=$(date +%s) && \
    echo "Total execution time for parsing the features toc: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"

# Javadoc Portion of Docs
RUN echo "Begin building javadoc content"  && \
    $BUILD_SCRIPTS_DIR/javadoc_clone.sh

# Move the javadocs into the web app
RUN echo "Moving javadocs to the jekyll webapp" && \
    timer_start=$(date +%s) && \
    cp -r src/main/content/docs-javadoc/modules target/jekyll-webapp/docs && \
    timer_end=$(date +%s) && \
    echo "Total execution time for copying javadoc to webapp: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"


# Special handling for javadocs
RUN $BUILD_SCRIPTS_DIR/javadoc_modify.sh  && \
    echo "Finished building Javadoc content" && \
    echo "Finished building all doc content"

#
#
#
FROM docs2 as docs3

ENV BUILD_SCRIPTS_DIR /scripts/build
ENV STAGING_SITE true

RUN $BUILD_SCRIPTS_DIR/gzip.sh

#
#
#
FROM icr.io/appcafe/open-liberty-devfile-stack:21.0.0.12 as war

COPY mvnw /
COPY .mvn /.mvn
COPY pom.xml /
COPY --from=docs3 --chown=1001:0 /src /src
COPY --from=docs3 --chown=1001:0 /target /target
RUN ./mvnw -B -Dhttps.protocols=TLSv1.2 package

#
#
#
FROM icr.io/appcafe/open-liberty:22.0.0.3-full-java8-openj9-ubi as runtime
ENV SEC_TLS_TRUSTDEFAULTCERTS true
COPY src/main/wlp/server.xml /config/server.xml
COPY --from=war --chown=1001:0 target/openliberty.war /config/apps/openliberty.war
