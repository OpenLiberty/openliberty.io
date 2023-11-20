ARG JAVA_VERSION=java11
ARG VERSION=1.0
ARG REVISION=SNAPSHOT
ARG GUIDE_NAME=Running GraphQL queries and mutations using a GraphQL client
FROM icr.io/appcafe/open-liberty:kernel-slim-${JAVA_VERSION}-openj9-ubi

LABEL \
  org.opencontainers.image.authors="Your Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-graphql-client" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="query" \
  version="$VERSION-$REVISION" \
  summary="The query microservice from the $GUIDE_NAME guide" \
  description="This image contains the query microservice running with the Open Liberty runtime."

COPY --chown=1001:0 src/main/liberty/config /config/
RUN features.sh
COPY --chown=1001:0 target/guide-graphql-client-query.war /config/apps

RUN configure.sh
