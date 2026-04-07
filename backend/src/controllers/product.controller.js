const db = require('../config/db');

exports.getProducts = (req, res) => {
    db.query('SELECT * FROM products', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
};

exports.addProduct = (req, res) => {
    const { name, category, brand, selling_price } = req.body;
    if (!name || !selling_price) return res.status(400).json({ error: 'Name and selling price are required' });
    db.query(
        'INSERT INTO products (name,category,brand,selling_price) VALUES (?,?,?,?)',
        [name, category || '', brand || '', selling_price],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product added', id: result.insertId });
        }
    );
};

exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, category, brand, selling_price } = req.body;

    db.query(
        'UPDATE products SET name=?, category=?, brand=?, selling_price=? WHERE id=?',
        [name, category, brand, selling_price, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product updated successfully' });
        }
    );
};

exports.updateStock = (req, res) => {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    if (stock_quantity === undefined || stock_quantity < 0) {
        return res.status(400).json({ error: 'Valid stock_quantity is required' });
    }

    db.query(
        'UPDATE products SET stock_quantity=? WHERE id=?',
        [stock_quantity, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Stock updated successfully' });
        }
    );
};

exports.deleteProduct = (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ error: 'Cannot delete product — it is referenced in existing sales or purchases.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Deleted' });
    });
};