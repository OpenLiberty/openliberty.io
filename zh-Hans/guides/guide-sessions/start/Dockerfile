FROM icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi

ARG VERSION=1.0
ARG REVISION=SNAPSHOT

LABEL \
  org.opencontainers.image.authors="Your Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-sessions" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="cart-app" \
  version="$VERSION-$REVISION" \
  summary="The cart application from the Sessions guide" \
  description="This image contains the cart application running with the Open Liberty runtime."

COPY --chown=1001:0 src/main/liberty/config /config/
RUN features.sh
COPY --chown=1001:0 target/guide-sessions.war /config/apps
COPY --chown=1001:0 target/liberty/wlp/usr/shared/resources/hazelcast-5.3.0.jar /opt/ol/wlp/usr/shared/resources

RUN configure.sh
