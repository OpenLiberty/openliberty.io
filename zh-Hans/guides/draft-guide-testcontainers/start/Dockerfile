# tag::from[]
FROM icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi
# end::from[]

ARG VERSION=1.0
ARG REVISION=SNAPSHOT

LABEL \
  org.opencontainers.image.authors="Your Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-testcontainers" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="inventory" \
  version="$VERSION-$REVISION" \
  summary="The inventory microservice from the Testcontainers guide" \
  description="This image contains the inventory microservice running with the Open Liberty runtime."

USER root

COPY --chown=1001:0 \
    src/main/liberty/config/ \
    /config/

RUN features.sh

COPY --chown=1001:0 \
    target/inventory.war \
    /config/apps

COPY --chown=1001:0 \
    target/liberty/wlp/usr/shared/resources/*.jar \
    /opt/ol/wlp/usr/shared/resources/

USER 1001

RUN configure.sh
