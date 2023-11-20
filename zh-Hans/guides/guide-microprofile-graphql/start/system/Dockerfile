ARG JAVA_VERSION=java11
ARG VERSION=1.0
ARG REVISION=SNAPSHOT
FROM icr.io/appcafe/open-liberty:full-${JAVA_VERSION}-openj9-ubi

LABEL \
  org.opencontainers.image.authors="Your Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-graphql-intro" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="system" \
  version="$VERSION-java11-$REVISION" \
  summary="The system microservice from the Querying and updating data with GraphQL guide" \
  description="This image contains the system microservice running with the Open Liberty runtime."

COPY --chown=1001:0 src/main/liberty/config /config/
RUN features.sh
COPY --chown=1001:0 target/guide-microprofile-graphql-system.war /config/apps

RUN configure.sh
