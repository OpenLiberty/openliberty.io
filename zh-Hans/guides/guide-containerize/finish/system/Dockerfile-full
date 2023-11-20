FROM icr.io/appcafe/open-liberty:full-java11-openj9-ubi

ARG VERSION=1.0
ARG REVISION=SNAPSHOT

LABEL \
  org.opencontainers.image.authors="Your Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-containerize" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
# tag::name[]
  name="system" \
# end::name[]
  version="$VERSION-$REVISION" \
# tag::summary[]
  summary="The system microservice from the Containerizing microservices guide" \
  description="This image contains the system microservice running with the Open Liberty runtime."
# end::summary[]

COPY --chown=1001:0 src/main/liberty/config /config/

# tag::copy-war[]
COPY --chown=1001:0 target/guide-containerize-system.war /config/apps
# end::copy-war[]

RUN configure.sh
