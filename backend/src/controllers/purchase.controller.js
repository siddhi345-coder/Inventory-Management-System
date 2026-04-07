const db = require('../config/db');

exports.getPurchases = (req, res) => {
    db.query(
        `SELECT p.*, s.name as supplier_name 
         FROM purchases p 
         LEFT JOIN suppliers s ON p.supplier_id = s.id 
         ORDER BY p.id DESC`,
        (err, data) => {
            if (err) return res.status(400).json({ error: err });
            res.json(data);
        }
    );
};

exports.createPurchase = (req, res) => {
    const { supplier_id, items } = req.body;

    if (!supplier_id || !items || items.length === 0) {
        return res.status(400).json({ error: 'supplier_id and items are required' });
    }

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: err.message });

        connection.beginTransaction((err) => {
            if (err) { connection.release(); return res.status(500).json({ error: err.message }); }

            connection.query(
                'INSERT INTO purchases (supplier_id,total_cost) VALUES (?,0)',
                [supplier_id],
                (err, result) => {
                    if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: err.message }); });

                    const purchaseId = result.insertId;
                    let pending = items.length * 2;
                    let failed = false;

                    const done = (err) => {
                        if (failed) return;
                        if (err) {
                            failed = true;
                            return connection.rollback(() => { connection.release(); res.status(500).json({ error: err.message }); });
                        }
                        if (--pending === 0) {
                            connection.commit((err) => {
                                connection.release();
                                if (err) return res.status(500).json({ error: err.message });
                                res.json({ message: 'Purchase added' });
                            });
                        }
                    };

                    items.forEach(item => {
                        connection.query(
                            'INSERT INTO purchase_items (purchase_id,product_id,quantity,cost_price) VALUES (?,?,?,?)',
                            [purchaseId, item.product_id, item.quantity, item.cost_price],
                            done
                        );
                        connection.query(
                            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id=?',
                            [item.quantity, item.product_id],
                            done
                        );
                    });
                }
            );
        });
    });
};