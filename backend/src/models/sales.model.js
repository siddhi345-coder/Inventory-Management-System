const db = require('../config/db');

exports.createSale = (customer_id, user_id) => {
    return db.promise().query(
        'INSERT INTO sales (customer_id,total_amount,created_by) VALUES (?,0,?)',
        [customer_id, user_id]
    );
};

exports.addSaleItem = (sale_id, product_id, quantity, price) => {
    return db.promise().query(
        'INSERT INTO sales_items (sale_id,product_id,quantity,price) VALUES (?,?,?,?)',
        [sale_id, product_id, quantity, price]
    );
};