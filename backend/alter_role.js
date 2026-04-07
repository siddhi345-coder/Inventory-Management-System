const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'laptop_shop'
});

db.connect((err) => {
    if (err) { console.error('Connection failed:', err); return; }
    console.log('Connected');

    db.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('admin','staff','manager') DEFAULT 'staff'",
        (err) => {
            if (err) console.error('ALTER failed:', err);
            else console.log('Role ENUM updated to include manager');
            db.end();
        }
    );
});
