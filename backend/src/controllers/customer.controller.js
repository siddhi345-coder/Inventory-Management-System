const db = require('../config/db');

exports.addCustomer = (req, res) => {
    const { name, phone, email } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
    db.query(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [name, phone, email || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Customer added', id: result.insertId });
        }
    );
};

exports.getCustomers = (req, res) => {
    db.query('SELECT * FROM customers', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
};

exports.getCustomerById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM customers WHERE id = ?', [id], (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        if (data.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(data[0]);
    });
};

exports.updateCustomer = (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    db.query(
        'UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?',
        [name, phone, email || null, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
            res.json({ message: 'Customer updated' });
        }
    );
};

exports.deleteCustomer = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM customers WHERE id = ?', [id], (err, result) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ error: 'Cannot delete customer — they have existing sales records.' });
            }
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    });
};