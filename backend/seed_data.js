const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'laptop_shop'
});

db.connect((err) => {
    if (err) { console.error('Connection failed:', err); return; }
    console.log('Connected to MySQL');
    runSeeds();
});

function runSeeds() {
    const suppliers = [
        ['Dell India Pvt Ltd',    'dell@gmail.com',    '9876543210', 'Bangalore, Karnataka'],
        ['HP Technologies',       'hp@gmail.com',      '9876543211', 'Mumbai, Maharashtra'],
        ['Lenovo Distributors',   'lenovo@gmail.com',  '9876543212', 'Delhi, NCR'],
        ['Asus India',            'asus@gmail.com',    '9876543213', 'Hyderabad, Telangana'],
        ['Apple Resellers India', 'apple@gmail.com',   '9876543214', 'Chennai, Tamil Nadu'],
    ];

    const products = [
        ['Dell Inspiron 15',       'Laptop',   'Dell',   55000.00, 20],
        ['Dell XPS 13',            'Laptop',   'Dell',   95000.00, 10],
        ['HP Pavilion 14',         'Laptop',   'HP',     52000.00, 15],
        ['HP Spectre x360',        'Laptop',   'HP',     120000.00, 8],
        ['Lenovo IdeaPad 3',       'Laptop',   'Lenovo', 45000.00, 25],
        ['Lenovo ThinkPad E14',    'Laptop',   'Lenovo', 75000.00, 12],
        ['Asus VivoBook 15',       'Laptop',   'Asus',   48000.00, 18],
        ['Asus ROG Strix G15',     'Gaming',   'Asus',   110000.00, 6],
        ['Apple MacBook Air M2',   'Laptop',   'Apple',  115000.00, 9],
        ['Apple MacBook Pro 14',   'Laptop',   'Apple',  175000.00, 5],
        ['Dell Gaming G15',        'Gaming',   'Dell',   85000.00, 7],
        ['HP Victus 16',           'Gaming',   'HP',     78000.00, 11],
    ];

    console.log('Inserting suppliers...');
    db.query('INSERT IGNORE INTO suppliers (name, email, phone, address) VALUES ?', [suppliers], (err, res) => {
        if (err) { console.error('Suppliers error:', err.message); db.end(); return; }
        console.log(`Suppliers inserted: ${res.affectedRows}`);

        console.log('Inserting products...');
        db.query('INSERT IGNORE INTO products (name, category, brand, selling_price, stock_quantity) VALUES ?', [products], (err, res) => {
            if (err) { console.error('Products error:', err.message); db.end(); return; }
            console.log(`Products inserted: ${res.affectedRows}`);

            // Fetch inserted IDs
            db.query('SELECT id FROM suppliers ORDER BY id', (err, sRows) => {
                db.query('SELECT id FROM products ORDER BY id', (err, pRows) => {
                    const s = sRows.map(r => r.id); // [s1, s2, s3, s4, s5]
                    const p = pRows.map(r => r.id); // [p1..p12]

                    // purchases: each supplier gets 2 purchases
                    // s[0]=Dell, s[1]=HP, s[2]=Lenovo, s[3]=Asus, s[4]=Apple
                    const purchases = [
                        [s[0], 165000.00, '2024-10-15'], // Dell purchase 1
                        [s[0], 255000.00, '2025-01-20'], // Dell purchase 2
                        [s[1], 156000.00, '2024-11-05'], // HP purchase 1
                        [s[1], 198000.00, '2025-02-10'], // HP purchase 2
                        [s[2], 135000.00, '2024-09-22'], // Lenovo purchase 1
                        [s[2], 225000.00, '2025-03-01'], // Lenovo purchase 2
                        [s[3], 144000.00, '2024-12-10'], // Asus purchase 1
                        [s[3], 330000.00, '2025-02-28'], // Asus purchase 2
                        [s[4], 345000.00, '2024-11-18'], // Apple purchase 1
                        [s[4], 525000.00, '2025-03-15'], // Apple purchase 2
                        // Cross-supplier: Dell also supplies some HP/Lenovo products
                        [s[0], 52000.00,  '2025-01-05'], // Dell supplies HP Pavilion too
                        [s[1], 55000.00,  '2025-01-10'], // HP supplies Dell Inspiron too
                    ];

                    db.query(
                        'INSERT INTO purchases (supplier_id, total_cost, created_at) VALUES ?',
                        [purchases.map(([sid, cost, date]) => [sid, cost, date])],
                        (err, res) => {
                            if (err) { console.error('Purchases error:', err.message); db.end(); return; }
                            console.log(`Purchases inserted: ${res.affectedRows}`);

                            const firstId = res.insertId;
                            const pu = Array.from({ length: purchases.length }, (_, i) => firstId + i);

                            // purchase_items: [purchase_id, product_id, quantity, cost_price]
                            const items = [
                                [pu[0],  p[0],  10, 48000.00],  // Dell pu1: Inspiron 15
                                [pu[0],  p[10], 5,  75000.00],  // Dell pu1: Gaming G15
                                [pu[1],  p[1],  5,  85000.00],  // Dell pu2: XPS 13
                                [pu[1],  p[0],  8,  47000.00],  // Dell pu2: Inspiron 15 (cheaper batch)
                                [pu[2],  p[2],  10, 46000.00],  // HP pu1: Pavilion 14
                                [pu[2],  p[11], 6,  70000.00],  // HP pu1: Victus 16
                                [pu[3],  p[3],  5,  108000.00], // HP pu2: Spectre x360
                                [pu[3],  p[2],  8,  45000.00],  // HP pu2: Pavilion 14
                                [pu[4],  p[4],  15, 40000.00],  // Lenovo pu1: IdeaPad 3
                                [pu[4],  p[5],  5,  67000.00],  // Lenovo pu1: ThinkPad E14
                                [pu[5],  p[4],  10, 39000.00],  // Lenovo pu2: IdeaPad 3
                                [pu[5],  p[5],  8,  68000.00],  // Lenovo pu2: ThinkPad E14
                                [pu[6],  p[6],  12, 42000.00],  // Asus pu1: VivoBook 15
                                [pu[6],  p[7],  6,  100000.00], // Asus pu1: ROG Strix
                                [pu[7],  p[6],  10, 43000.00],  // Asus pu2: VivoBook 15
                                [pu[7],  p[7],  8,  102000.00], // Asus pu2: ROG Strix
                                [pu[8],  p[8],  5,  105000.00], // Apple pu1: MacBook Air M2
                                [pu[8],  p[9],  3,  160000.00], // Apple pu1: MacBook Pro 14
                                [pu[9],  p[8],  6,  107000.00], // Apple pu2: MacBook Air M2
                                [pu[9],  p[9],  4,  162000.00], // Apple pu2: MacBook Pro 14
                                [pu[10], p[2],  8,  44000.00],  // Dell also supplies HP Pavilion
                                [pu[11], p[0],  10, 46000.00],  // HP also supplies Dell Inspiron
                            ];

                            db.query(
                                'INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price) VALUES ?',
                                [items],
                                (err, res) => {
                                    if (err) { console.error('Purchase items error:', err.message); db.end(); return; }
                                    console.log(`Purchase items inserted: ${res.affectedRows}`);
                                    console.log('\nSeed complete! Supplier → Product mapping:');
                                    console.log('  Dell       → Inspiron 15, XPS 13, Gaming G15, HP Pavilion 14');
                                    console.log('  HP         → Pavilion 14, Victus 16, Spectre x360, Dell Inspiron 15');
                                    console.log('  Lenovo     → IdeaPad 3, ThinkPad E14');
                                    console.log('  Asus       → VivoBook 15, ROG Strix G15');
                                    console.log('  Apple      → MacBook Air M2, MacBook Pro 14');
                                    db.end();
                                }
                            );
                        }
                    );
                });
            });
        });
    });
}
