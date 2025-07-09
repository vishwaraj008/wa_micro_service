CREATE DATABASE wa_micro;
USE wa_micro;
CREATE TABLE services (
id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
service_name VARCHAR(255) NOT NULL,
service_secret VARCHAR(255) NOT NULL,
service_indetifier BIGINT NOT NULL
);