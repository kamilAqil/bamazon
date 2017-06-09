CREATE DATABASE bamazon;

USE bamazon;


CREATE TABLE products(
item_id INT NOT NULL AUTO_INCREMENT,
product_name VARCHAR(100) NOT NULL,
department_name VARCHAR(100) NOT NULL,
price INT(6),
stock_quantity INT(6),
PRIMARY KEY (item_id));
