#
#
# One major factor for using `pipeline-base-image:2.6` is to stay on an older Python 3.6 until the python
# scripts are migrated to use a higher version
FROM icr.io/continuous-delivery/pipeline/pipeline-base-image:2.6 as builder
SHELL ["/bin/bash", "-c"]

COPY scripts /scripts

RUN apt-get update && \
    apt-get -y install curl gnupg build-essential ruby-full git python3 python3-bs4 python3-lxml \
    libgdbm-dev libncurses5-dev automake libtool bison libffi-dev 

ENV BUILD_SCRIPTS_DIR /scripts/build
RUN $BUILD_SCRIPTS_DIR/ruby_install_ce.sh

RUN $BUILD_SCRIPTS_DIR/node_install.sh

ENV NODE_VERSION="v16.15.1"
# After node install script ran, need to export the path
ENV PATH="/root/.nvm/versions/node/${NODE_VERSION}/bin/:${PATH}"
RUN echo "npm analysis during build"
RUN npm ls -g --depth=0

RUN echo "Install Antora"
RUN npm i -g @antora/cli@3.0.1
