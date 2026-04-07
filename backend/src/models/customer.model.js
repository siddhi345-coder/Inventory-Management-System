const db = require('../config/db');

exports.createCustomer = (name, phone) => {
    return db.promise().query(
        'INSERT INTO customers (name,phone) VALUES (?,?)',
        [name, phone]
    );
};

exports.getAllCustomers = () => {
    return db.promise().query('SELECT * FROM customers');
};