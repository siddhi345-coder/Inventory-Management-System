const db = require('../config/db');

exports.getSales = (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit, 10);
        let sql = `SELECT s.id, s.customer_id, s.total_amount, CAST(s.created_by AS UNSIGNED) as created_by, s.sale_date,
                    c.name as customer_name, u.name as staff_name
             FROM sales s
             LEFT JOIN customers c ON s.customer_id = c.id
             LEFT JOIN users u ON s.created_by = u.id
             ORDER BY s.sale_date DESC`;
        const params = [];

        if (!Number.isNaN(limit) && limit > 0) {
            sql += ' LIMIT ?';
            params.push(limit);
        }

        db.query(sql, params, (err, data) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(data);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSaleById = (req, res) => {
    try {
        const { id } = req.params;
        db.query(
            `SELECT s.*, 
                    c.name as customer_name,
                    u.name as staff_name,
                    GROUP_CONCAT(
                        JSON_OBJECT('id', si.id, 'product_id', si.product_id, 'quantity', si.quantity, 'unit_price', si.price, 'product_name', p.name)
                    ) as items_json
             FROM sales s
             LEFT JOIN customers c ON s.customer_id = c.id
             LEFT JOIN users u ON s.created_by = u.id
             LEFT JOIN sales_items si ON s.id = si.sale_id
             LEFT JOIN products p ON si.product_id = p.id
             WHERE s.id = ?
             GROUP BY s.id`,
            [id],
            (err, data) => {
                if (err) return res.status(500).json({ error: err.message });
                if (data.length > 0) {
                    const sale = data[0];
                    if (sale.items_json) {
                        try {
                            sale.items = JSON.parse('[' + sale.items_json + ']');
                        } catch (e) {
                            sale.items = [];
                        }
                    } else {
                        sale.items = [];
                    }
                    delete sale.items_json;
                }
                res.json(data[0]);
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSale = (req, res) => {
    console.log('Create sale request received:', req.body);
    const { customer_id, customer, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        console.log('No items in request');
        return res.status(400).json({ error: 'Sale items are required' });
    }

    console.log('Processing items:', items);

    const normalizedItems = items.map((item) => ({
        product_id: item.product_id || item.productId || item.id,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price ?? item.unit_price ?? 0),
    }));

    if (normalizedItems.some((item) => !item.product_id || item.quantity <= 0 || Number.isNaN(item.price))) {
        return res.status(400).json({ error: 'Invalid sale item data' });
    }

    const findOrCreateCustomer = (callback) => {
        if (customer_id) {
            return callback(null, customer_id);
        }

        if (!customer || !customer.name || !customer.phone) {
            return callback({ message: 'Customer name and phone are required' });
        }

        db.query(
            'SELECT id FROM customers WHERE phone = ? LIMIT 1',
            [customer.phone],
            (err, data) => {
                if (err) return callback(err);
                if (data && data.length > 0) {
                    return callback(null, data[0].id);
                }

                db.query(
                    'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
                    [customer.name, customer.phone, customer.email || null],
                    (err, result) => {
                        if (err) return callback(err);
                        callback(null, result.insertId);
                    }
                );
            }
        );
    };

    findOrCreateCustomer((err, resolvedCustomerId) => {
        if (err) {
            return res.status(400).json({ error: err.message || err });
        }

        const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        db.beginTransaction((transactionErr) => {
            if (transactionErr) {
                return res.status(500).json({ error: transactionErr.message || transactionErr });
            }

            db.query(
                'INSERT INTO sales (customer_id, total_amount, created_by) VALUES (?, ?, ?)',
                [resolvedCustomerId, totalAmount, req.user.id],
                (err, result) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                    }

                    const saleId = result.insertId;
                    let itemsProcessed = 0;
                    let hasError = false;

                    normalizedItems.forEach((item) => {
                        db.query(
                            'INSERT INTO sales_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                            [saleId, item.product_id, item.quantity, item.price],
                            (err) => {
                                if (hasError) return;
                                if (err) {
                                    hasError = true;
                                    return db.rollback(() => res.status(500).json({ error: err.message }));
                                }

                                db.query(
                                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                                    [item.quantity, item.product_id],
                                    (err) => {
                                        if (hasError) return;
                                        if (err) {
                                            hasError = true;
                                            return db.rollback(() => res.status(500).json({ error: err.message }));
                                        }

                                        itemsProcessed += 1;
                                        if (itemsProcessed === normalizedItems.length) {
                                            db.commit((commitErr) => {
                                                if (commitErr) {
                                                    return db.rollback(() => res.status(500).json({ error: commitErr.message }));
                                                }
                                                res.json({ message: 'Sale created successfully', saleId });
                                            });
                                        }
                                    }
                                );
                            }
                        );
                    });
                }
            );
        });
    });
};
