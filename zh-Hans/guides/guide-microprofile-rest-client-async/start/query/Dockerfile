FROM icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

ARG VERSION=1.0
ARG REVISION=SNAPSHOT

LABEL \
  org.opencontainers.image.authors="My Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-microprofile-reactive-rest-client-async" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="query" \
  version="$VERSION-$REVISION" \
  summary="The query microservice from the 'Learn how to use MicroProfile Rest Client to invoke RESTful microservices asynchronously over HTTP' guide" \
  description="This image contains the query microservice running with the Open Liberty runtime."

COPY --chown=1001:0 src/main/liberty/config /config/
RUN features.sh
COPY --chown=1001:0 target/query.war /config/apps

EXPOSE 9080 9443

# It is recommended to run the configure.sh when build image for production.
# RUN configure.sh