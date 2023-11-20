# Stage and thin the application 
# tag::OLimage1[]
FROM icr.io/appcafe/open-liberty:full-java8-openj9-ubi as staging
# end::OLimage1[]

# tag::copyJar[]
COPY --chown=1001:0 target/guide-spring-boot-0.1.0.jar \
                    /staging/fat-guide-spring-boot-0.1.0.jar
# end::copyJar[]

# tag::springBootUtility[]
RUN springBootUtility thin \
 --sourceAppPath=/staging/fat-guide-spring-boot-0.1.0.jar \
 --targetThinAppPath=/staging/thin-guide-spring-boot-0.1.0.jar \
 --targetLibCachePath=/staging/lib.index.cache
# end::springBootUtility[]

# Build the image
# tag::OLimage2[]
FROM icr.io/appcafe/open-liberty:kernel-slim-java8-openj9-ubi
# end::OLimage2[]

ARG VERSION=1.0
ARG REVISION=SNAPSHOT

LABEL \
  org.opencontainers.image.authors="Your Name" \
  org.opencontainers.image.vendor="Open Liberty" \
  org.opencontainers.image.url="local" \
  org.opencontainers.image.source="https://github.com/OpenLiberty/guide-spring-boot" \
  org.opencontainers.image.version="$VERSION" \
  org.opencontainers.image.revision="$REVISION" \
  vendor="Open Liberty" \
  name="hello app" \
  version="$VERSION-$REVISION" \
  summary="The hello application from the Spring Boot guide" \
  description="This image contains the hello application running with the Open Liberty runtime."

# tag::serverXml[]
RUN cp /opt/ol/wlp/templates/servers/springBoot2/server.xml /config/server.xml
# end::serverXml[]

RUN features.sh

# tag::libcache[]
COPY --chown=1001:0 --from=staging /staging/lib.index.cache /lib.index.cache
# end::libcache[]
# tag::thinjar[]
COPY --chown=1001:0 --from=staging /staging/thin-guide-spring-boot-0.1.0.jar \
                    /config/dropins/spring/thin-guide-spring-boot-0.1.0.jar
# end::thinjar[]

RUN configure.sh 
