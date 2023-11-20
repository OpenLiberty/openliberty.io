FROM icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

ARG VERSION=1.0
ARG REVISION=SNAPSHOT

LABEL \
  org.opencontainers.image.authors="My Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-reactive-messaging-sse" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="bff" \
  version="$VERSION-$REVISION" \
  summary="The bff microservice from the 'Streaming messages to a client using Server-Sent Events' guide" \
  description="This image contains the bff microservice running with the Open Liberty runtime."

COPY --chown=1001:0 src/main/liberty/config /config/
RUN features.sh
COPY --chown=1001:0 target/bff.war /config/apps

EXPOSE 9084 9444

# It is recommended to run the configure.sh when build image for production.
RUN configure.sh
