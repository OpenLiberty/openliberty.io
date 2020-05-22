FROM open-liberty:kernel

ENV SEC_TLS_TRUSTDEFAULTCERTS true

COPY src/main/wlp/server.xml /config/server.xml

COPY target/openliberty.war /config/dropins/openliberty.war
