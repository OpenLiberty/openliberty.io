FROM icr.io/appcafe/ibm-semeru-runtimes:open-11-jdk-ubi as staging

# Define the variables for the OpenSSL subject.
ARG COUNTRY=CA
ARG STATE=Ontario
ARG LOCALITY=Markham
ARG ORG=IBM
ARG UNIT=OpenLiberty
ARG COMMON_NAME=localhost

# Generate a self-signed certificate and private key.
RUN openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
    -out /tmp/cert.pem \
    -keyout /tmp/private.key \
    -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORG/OU=$UNIT/CN=$COMMON_NAME"

# Combine the self-signed certificate and private key.
RUN cat /tmp/private.key /tmp/cert.pem > /tmp/mongodb_tls.pem

# Import combined file to truststore.
RUN keytool -import -trustcacerts -keystore /tmp/truststore.p12 \
    -storepass mongodb -storetype PKCS12 -alias mongo -file /tmp/cert.pem -noprompt

FROM mongo:latest

# Create the directories.
RUN mkdir /home/mongodb
RUN mkdir /home/mongodb/data
RUN mkdir /home/mongodb/certs
RUN mkdir /home/mongodb/logs
RUN chown -R mongodb:mongodb /home/mongodb

# Copy the certificates over from stage one.
COPY --from=staging /tmp /home/mongodb/certs

# Copy the configuration and setup files from
# the host machine to the image.
COPY assets/mongodb.conf /home/mongodb
COPY assets/index.js /home/mongodb

# Run MongodDB daemon and execute the setup script.
RUN mongod \
        --fork \
        --config /home/mongodb/mongodb.conf \
    && mongosh \
        testdb \
        -tls \
        --tlsCAFile /home/mongodb/certs/cert.pem \
        --host localhost \
        /home/mongodb/index.js \
    && mongod --dbpath /home/mongodb/data --shutdown \
    && chown -R mongodb /home/mongodb

# Start MongoDB daemon when the image is run in a container.
CMD ["mongod", "--config", "/home/mongodb/mongodb.conf"]
