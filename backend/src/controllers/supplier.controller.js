const db = require('../config/db');

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