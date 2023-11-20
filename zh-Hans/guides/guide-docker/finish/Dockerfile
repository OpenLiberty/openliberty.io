# Start with OL runtime.
# tag::from[]
FROM icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi
# end::from[]

ARG VERSION=1.0
ARG REVISION=SNAPSHOT
# tag::label[]

LABEL \
  org.opencontainers.image.authors="Your Name" \
  org.opencontainers.image.vendor="IBM" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-docker" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="system" \
  version="$VERSION-$REVISION" \
  summary="The system microservice from the Docker Guide" \
  # tag::description[]
  description="This image contains the system microservice running with the Open Liberty runtime."
  # end::description[]
# end::label[]

# tag::user-root[]
USER root
# end::user-root[]

# tag::copy[]
COPY --chown=1001:0 src/main/liberty/config/server.xml /config/
RUN features.sh
COPY --chown=1001:0 target/*.war /config/apps/
# end::copy[]
RUN configure.sh
# tag::user[]
USER 1001
# end::user[]
