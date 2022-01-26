#
#
#
FROM ubuntu:20.04 as ruby

SHELL ["/bin/bash", "-c"]

COPY scripts /scripts

# Have all the commands on one RUN to avoid multiple layers.  Each RUN command is a layer.
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install \
    curl gnupg build-essential ruby-full git python3 python3-bs4

ENV BUILD_SCRIPTS_DIR /scripts/build
RUN scripts/build/ruby_install.sh
# RUN scripts/build/node_install.sh

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

RUN scripts/build/antora_install.sh

# RUN cd antora \
#     && yarn \
#     && cd .. \
#     && mv -f src/main/content/_assets/js/custom-include-processor.js antora/node_modules/@antora/asciidoc-loader/lib/include/include-processor.js \
#     && pushd src/main/content/antora_ui \
#     && echo "Installing Antora dependencies" \
#     && # npm install -g @antora/site-generator-default@2.3.3 # add back this line when upgrading antora to 3.0 \
#     && npm install gulp -g \
#     && npm install node-sass gulp-sass --save-dev \
#     && npm install --production \
#     && gulp sass:convert \
#     && SOURCEMAPS=true gulp build \
#     && gulp bundle:pack \
#     && popd

#
#
#
FROM myruby:latest as jekyll

COPY gems /gems
COPY robots.txt /
COPY src /src
COPY scripts /scripts

ENV BUILD_SCRIPTS_DIR /scripts/build

RUN ./scripts/build/jekyll.sh

# This is for running this image for development
CMD ["./scripts/jekyll_serve_dev.sh"]

#
#
#
FROM myjekyll:latest as javadocs

ENV BUILD_SCRIPTS_DIR /scripts/build
ENV STAGING_SITE true

RUN $BUILD_SCRIPTS_DIR/javadoc_clone.sh

#
#
#
FROM myjavadocs:latest as docs1

ENV BUILD_SCRIPTS_DIR /scripts/build
ENV STAGING_SITE true

RUN $BUILD_SCRIPTS_DIR/docs_part_1.sh

#
#
#
FROM mydocs1:latest as docs2

ENV BUILD_SCRIPTS_DIR /scripts/build
ENV STAGING_SITE true

RUN $BUILD_SCRIPTS_DIR/docs_part_2.sh

#
#
#
FROM mydocs2:latest as docs3

ENV BUILD_SCRIPTS_DIR /scripts/build
ENV STAGING_SITE true

RUN $BUILD_SCRIPTS_DIR/gzip.sh

#
#
#
# FROM mydocs3:latest as runtime
FROM icr.io/appcafe/open-liberty-devfile-stack:21.0.0.12 as war

COPY mvnw /
COPY .mvn /.mvn
COPY pom.xml /
COPY src /src
COPY --from=docs3 --chown=1001:0 /target /target
RUN ./mvnw -B -Dhttps.protocols=TLSv1.2 package

#
#
#
# FROM icr.io/appcafe/ibm-semeru-runtimes as build

# COPY mvnw /
# COPY --from=docs3 --chown=1001:0 /target /config/apps/

FROM icr.io/appcafe/open-liberty:22.0.0.3-full-java8-openj9-ubi as runtime
ENV SEC_TLS_TRUSTDEFAULTCERTS true
COPY src/main/wlp/server.xml /config/server.xml
COPY --from=war --chown=1001:0 target/openliberty.war /config/apps/
