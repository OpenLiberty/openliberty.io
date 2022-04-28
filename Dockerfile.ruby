FROM ubuntu:18.04
SHELL ["/bin/bash", "-c"]

COPY scripts /scripts

ENV DEBIAN_FRONTEND=noninteractive

# Have all the commands on one RUN to avoid multiple layers.  Each RUN command is a layer.
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
