FROM open-liberty:springBoot2 as staging


# The APP_FILE ARG provides the final name of the Spring Boot application archive
ARG APP_FILE


# Stage the fat JAR
COPY target/${APP_FILE} /staging/${APP_FILE}


# Thin the fat application; stage the thin app output and the library cache
RUN springBootUtility thin --sourceAppPath=/staging/${APP_FILE} --targetThinAppPath=/staging/thin-${APP_FILE} --targetLibCachePath=/staging/lib.index.cache


# Final stage, only copying the liberty installation (includes primed caches)
# and the lib.index.cache and thin application
FROM open-liberty:springBoot2


ARG APP_FILE


COPY --from=staging /staging/lib.index.cache /lib.index.cache


COPY --from=staging /staging/thin-${APP_FILE} /config/dropins/spring/thin-${APP_FILE}
