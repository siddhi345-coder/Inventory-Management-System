const db = require('../config/db');

// User: submit a product request
exports.createRequest = (req, res) => {
    const { product_id, quantity, note } = req.body;
    const user_id = req.user.id;

    if (!product_id || !quantity) {
        return res.status(400).json({ message: 'product_id and quantity are required' });
    }

    db.query(
        'INSERT INTO product_requests (user_id, product_id, quantity, note) VALUES (?,?,?,?)',
        [user_id, product_id, quantity, note || null],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to create request' });
            res.status(201).json({ message: 'Request submitted', id: result.insertId });
        }
    );
};

// User: get own requests
exports.getMyRequests = (req, res) => {
    const user_id = req.user.id;
    db.query(
        `SELECT pr.id, p.name AS product_name, p.brand, p.selling_price,
                pr.quantity, pr.note, pr.status, pr.created_at
         FROM product_requests pr
         JOIN products p ON pr.product_id = p.id
         WHERE pr.user_id = ?
         ORDER BY pr.created_at DESC`,
        [user_id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch requests' });
            res.json(rows);
        }
    );
};

// Staff/Admin: get all requests
exports.getAllRequests = (req, res) => {
    db.query(
        `SELECT pr.id, u.name AS user_name, u.email AS user_email,
                p.name AS product_name, p.brand, p.selling_price,
                pr.quantity, pr.note, pr.status, pr.created_at
         FROM product_requests pr
         JOIN users u ON pr.user_id = u.id
         JOIN products p ON pr.product_id = p.id
         ORDER BY pr.created_at DESC`,
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch requests' });
            res.json(rows);
        }
    );
};

// Staff/Admin: update request status
exports.updateRequestStatus = (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    db.query(
        'UPDATE product_requests SET status = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to update status' });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Request not found' });
            res.json({ message: 'Status updated' });
        }
    );
};
