FROM ubuntu:20.04

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

# RUN scripts/build/antora_install.sh

