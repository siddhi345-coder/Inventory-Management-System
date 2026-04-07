const db = require('../config/db');

exports.getDashboardStats = (req, res) => {
    try {
        // Total products
        db.query('SELECT COUNT(*) as total FROM products', (err, productData) => {
            if (err) return res.status(400).json({ error: err });

            const totalProducts = productData[0].total;

            // Stock value (sum of stock_quantity * selling_price)
            db.query('SELECT SUM(stock_quantity * selling_price) as stockValue FROM products', (err, stockData) => {
                if (err) return res.status(400).json({ error: err });

                const stockValue = stockData[0].stockValue || 0;

                // Monthly sales (current month)
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');

                db.query(
                    `SELECT SUM(total_amount) as monthlySales FROM sales 
                     WHERE MONTH(sale_date) = ? AND YEAR(sale_date) = ?`,
                    [month, year],
                    (err, salesData) => {
                        if (err) return res.status(400).json({ error: err });

                        const monthlySales = salesData[0].monthlySales || 0;

                        // Low stock alerts (products with stock <= 6)
                        db.query('SELECT COUNT(*) as lowStock FROM products WHERE stock_quantity < 10', (err, lowStockData) => {
                            if (err) return res.status(400).json({ error: err });

                            const lowStock = lowStockData[0].lowStock;

                            res.json({
                                totalProducts,
                                stockValue: parseFloat(stockValue),
                                monthlySales: parseFloat(monthlySales),
                                lowStockAlerts: lowStock,
                            });
                        });
                    }
                );
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTopProducts = (req, res) => {
    try {
        db.query(
            `SELECT p.id, p.name, 
                    SUM(si.quantity) as totalSold,
                    p.selling_price,
                    (SUM(si.quantity) / (SELECT SUM(quantity) FROM sales_items)) * 100 as percentage
             FROM products p
             LEFT JOIN sales_items si ON p.id = si.product_id
             GROUP BY p.id, p.name, p.selling_price
             ORDER BY totalSold DESC
             LIMIT 5`,
            (err, data) => {
                if (err) return res.status(400).json({ error: err });
                res.json(data);
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesChartData = (req, res) => {
    try {
        db.query(
            `SELECT 
                DATE_FORMAT(sale_date, '%b') as month,
                COUNT(id) as sales,
                SUM(total_amount) as revenue
             FROM sales
             WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY MONTH(sale_date), DATE_FORMAT(sale_date, '%b')
             ORDER BY MONTH(sale_date)`,
            (err, data) => {
                if (err) return res.status(400).json({ error: err });
                res.json(data);
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRecentActivities = (req, res) => {
    try {
        db.query(
            `SELECT 
                s.id,
                'sale' as type,
                CONCAT('Sale #', s.id, ' - ₹', s.total_amount) as message,
                s.sale_date as timestamp,
                c.name as customerName
             FROM sales s
             LEFT JOIN customers c ON s.customer_id = c.id
             ORDER BY s.sale_date DESC
             LIMIT 10`,
            (err, data) => {
                if (err) return res.status(400).json({ error: err });
                res.json(data);
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesOverview = (req, res) => {
    try {
        db.query(
            `SELECT 
                COUNT(DISTINCT id) as totalSales,
                SUM(total_amount) as totalRevenue,
                AVG(total_amount) as avgOrderValue
             FROM sales`,
            (err, data) => {
                if (err) return res.status(400).json({ error: err });
                res.json(data[0]);
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
