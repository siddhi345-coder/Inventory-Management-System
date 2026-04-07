const db = require('../config/db');

exports.createPurchase = (supplier_id) => {
    return db.promise().query(
        'INSERT INTO purchases (supplier_id,total_cost) VALUES (?,0)',
        [supplier_id]
    );
};

exports.addPurchaseItem = (purchase_id, product_id, quantity, cost_price) => {
    return db.promise().query(
        'INSERT INTO purchase_items (purchase_id,product_id,quantity,cost_price) VALUES (?,?,?,?)',
        [purchase_id, product_id, quantity, cost_price]
    );
};