FROM postgres:14.1

# set env variable for password to docker
ENV POSTGRES_PASSWORD adminpwd
# create database called database
ENV POSTGRES_USER admin

# Use dumpfile to create table schema and populate it with data
ADD schema.sql /docker-entrypoint-initdb.d/1-schema.sql

EXPOSE 5432
