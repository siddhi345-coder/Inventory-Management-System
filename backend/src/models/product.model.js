const db = require('../config/db');

exports.getAllProducts = () => {
    return db.promise().query('SELECT * FROM products');
};

exports.createProduct = (name, category, brand, price) => {
    return db.promise().query(
        'INSERT INTO products (name,category,brand,selling_price) VALUES (?,?,?,?)',
        [name, category, brand, price]
    );
};

exports.updateProduct = (id, name, price) => {
    return db.promise().query(
        'UPDATE products SET name=?, selling_price=? WHERE id=?',
        [name, price, id]
    );
};

exports.deleteProduct = (id) => {
    return db.promise().query(
        'DELETE FROM products WHERE id=?',
        [id]
    );
};

exports.updateStock = (product_id, quantity) => {
    return db.promise().query(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id=?',
        [quantity, product_id]
    );
};

exports.reduceStock = (product_id, quantity) => {
    return db.promise().query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id=?',
        [quantity, product_id]
    );
};