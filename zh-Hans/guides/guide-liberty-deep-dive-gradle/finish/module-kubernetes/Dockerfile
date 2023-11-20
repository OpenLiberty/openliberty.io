# tag::from[]
FROM icr.io/appcafe/open-liberty:full-java11-openj9-ubi
# end::from[]

ARG VERSION=1.0
ARG REVISION=SNAPSHOT

# tag::label[]
LABEL \
  org.opencontainers.image.authors="My Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-liberty-deepdive-gradle" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="inventory" \
  version="$VERSION-$REVISION" \
  summary="" \
  description="This image contains the inventory microservice running with the Open Liberty runtime."
# end::label[]

USER root

# tag::copy[]
# tag::copy-config[]
# tag::config-userID[]
COPY --chown=1001:0 \
# end::config-userID[]
    # tag::inventory-config[]
    src/main/liberty/config/ \
    # end::inventory-config[]
    # tag::config[]
    /config/
    # end::config[]
# end::copy-config[]

# tag::copy-war[]
# tag::war-userID[]
COPY --chown=1001:0 \
# end::war-userID[]
    # tag::inventory-war[]
    target/inventory.war \
    # end::inventory-war[]
    # tag::config-apps[]
    /config/apps
    # end::config-apps[]
# end::copy-war[]

# tag::copy-postgres[]
COPY --chown=1001:0 \
    target/liberty/wlp/usr/shared/resources/*.jar \
    /opt/ol/wlp/usr/shared/resources/
# end::copy-postgres[]
# end::copy[]

USER 1001

RUN configure.sh
