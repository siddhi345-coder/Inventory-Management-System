const db = require('../config/db');

exports.getSupplierProducts = (req, res) => {
    db.query(
        `SELECT p.id, p.name, p.category, p.brand,
                MAX(pi.cost_price) AS price,
                MAX(pu.created_at) AS last_purchase_date
         FROM purchase_items pi
         JOIN purchases pu ON pi.purchase_id = pu.id
         JOIN products p ON pi.product_id = p.id
         WHERE pu.supplier_id = ?
         GROUP BY p.id, p.name, p.category, p.brand`,
        [req.params.id],
        (err, data) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(data);
        }
    );
};

exports.getProductSuppliers = (req, res) => {
    db.query(
        `SELECT s.id, s.name, s.phone, s.email,
                COUNT(pu.id) AS purchase_count,
                MAX(pi.cost_price) AS price
         FROM purchase_items pi
         JOIN purchases pu ON pi.purchase_id = pu.id
         JOIN suppliers s ON pu.supplier_id = s.id
         WHERE pi.product_id = ?
         GROUP BY s.id, s.name, s.phone, s.email
         ORDER BY purchase_count DESC`,
        [req.params.productId],
        (err, data) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(data);
        }
    );
};

exports.getSuppliers = (req, res) => {
    db.query('SELECT * FROM suppliers', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
};

exports.addSupplier = (req, res) => {
    const { name, phone, email, address } = req.body;
    db.query(
        'INSERT INTO suppliers (name,phone,email,address) VALUES (?,?,?,?)',
        [name, phone, email, address],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Supplier added' });
        }
    );
};

exports.updateSupplier = (req, res) => {
    const { name, phone, email, address } = req.body;
    db.query(
        'UPDATE suppliers SET name=?,phone=?,email=?,address=? WHERE id=?',
        [name, phone, email, address, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Supplier updated' });
        }
    );
};

exports.deleteSupplier = (req, res) => {
    db.query('DELETE FROM suppliers WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Supplier deleted' });
    });
};