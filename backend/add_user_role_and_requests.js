const mysql = require('mysql2');
require('dotenv').config({ path: __dirname + '/.env' });

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'laptop_shop'
});

db.connect((err) => {
    if (err) { console.error('Connection failed:', err); return; }
    console.log('Connected');

    const queries = [
        // Add 'user' to role enum
        `ALTER TABLE users MODIFY COLUMN role ENUM('admin','staff','manager','user') DEFAULT 'staff'`,

        // Create product_requests table
        `CREATE TABLE IF NOT EXISTS product_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            note TEXT,
            status ENUM('pending','approved','rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`
    ];

    let done = 0;
    queries.forEach((q, i) => {
        db.query(q, (err) => {
            if (err) console.error(`Query ${i + 1} error:`, err.message);
            else console.log(`Query ${i + 1} done`);
            if (++done === queries.length) { console.log('Migration complete'); db.end(); }
        });
    });
});
