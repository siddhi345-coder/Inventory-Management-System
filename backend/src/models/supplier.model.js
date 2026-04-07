const db = require('../config/db');

exports.createSupplier = (name, phone, email, address) => {
    return db.promise().query(
        'INSERT INTO suppliers (name,phone,email,address) VALUES (?,?,?,?)',
        [name, phone, email, address]
    );
};

exports.getAllSuppliers = () => {
    return db.promise().query('SELECT * FROM suppliers');
};