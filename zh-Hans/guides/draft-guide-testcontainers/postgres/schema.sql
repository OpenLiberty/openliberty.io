CREATE TABLE SystemData (
    id SERIAL,
    hostname varchar(50),
    osName varchar(50),
    javaVersion varchar(50),
    heapSize bigint,
    primary key(id)
);

CREATE SEQUENCE systemData_id
START 1
INCREMENT 1
OWNED BY SystemData.id;