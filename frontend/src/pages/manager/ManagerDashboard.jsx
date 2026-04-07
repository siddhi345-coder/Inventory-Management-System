import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/dashboard/StatCard';
import { getDashboardStats } from '../../services/dashboardService';
import { getProducts } from '../../services/productService';
import { getSalesReport, downloadExcel, downloadPDF } from '../../services/reportService';
import '../../styles/admin-dashboard.css';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, stockValue: 0, monthlySales: 0, lowStockAlerts: 0 });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState(false);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
    getProducts()
      .then((data) => setProducts(data || []))
      .catch(console.error);
    getSalesReport()
      .then((data) => setReportSummary(data.summary))
      .catch(() => setReportError(true))
      .finally(() => setReportLoading(false));
  }, []);

  const fmt = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const handleDownload = (type) => {
    setDownloading(type);
    if (type === 'excel') downloadExcel();
    else downloadPDF();
    setTimeout(() => setDownloading(''), 2000);
  };

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Manager Dashboard</h1>
            <p>Full access to inventory, purchases, sales and customer management</p>
          </div>
        </div>

        {!loading && (
          <div className="stats-grid">
            <StatCard title="Total Products" value={stats.totalProducts} color="#3b82f6" icon="📦" trend="Items in inventory" />
            <StatCard title="Stock Value" value={fmt(stats.stockValue)} color="#10b981" icon="💰" trend="Total inventory value" />
            <StatCard title="Monthly Sales" value={fmt(stats.monthlySales)} color="#f59e0b" icon="📈" trend="Sales this month" />
            <StatCard title="Low Stock Alerts" value={stats.lowStockAlerts} color="#ef4444" icon="⚠️" trend="Items below threshold" />
          </div>
        )}

        <div style={{ marginTop: '36px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '24px' }}>
          <h2 style={{ marginBottom: '4px', color: '#333' }}>Stock Overview</h2>
          <p style={{ margin: '0 0 16px', color: '#999', fontSize: '13px' }}>Products with stock below 10 are highlighted in red</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: '#555' }}>Product</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: '#555' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: '#555' }}>Brand</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', color: '#555' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', color: '#555' }}>Stock</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px', color: '#555' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No products found</td></tr>
                ) : (
                  products.map((p) => {
                    const stock = Number(p.stock_quantity);
                    const isLow = stock < 10;
                    return (
                      <tr
                        key={p.id}
                        style={{
                          background: isLow ? '#fff5f5' : 'white',
                          borderBottom: '1px solid #e2e8f0',
                          transition: 'background 0.2s',
                        }}
                      >
                        <td style={{ padding: '10px 14px', fontWeight: isLow ? '600' : '400', color: isLow ? '#c53030' : '#333' }}>{p.name}</td>
                        <td style={{ padding: '10px 14px', color: '#555' }}>{p.category || '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#555' }}>{p.brand || '—'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#555' }}>₹{Number(p.selling_price).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: isLow ? '#e53e3e' : '#38a169', fontSize: '15px' }}>
                          {stock}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {isLow ? (
                            <span style={{ background: '#fed7d7', color: '#c53030', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>⚠️ Low Stock</span>
                          ) : (
                            <span style={{ background: '#c6f6d5', color: '#276749', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>✅ In Stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* ── Reports Section ─────────────────────────────────────────── */}
        <div style={{ marginTop: '28px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: '0 0 4px', color: '#333' }}>📊 Sales Reports</h2>
              <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>Download full sales report as Excel or PDF</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleDownload('excel')}
                disabled={downloading === 'excel'}
                style={{ padding: '10px 20px', background: downloading === 'excel' ? '#aaa' : '#1D6F42', color: '#fff', border: 'none', borderRadius: 8, cursor: downloading === 'excel' ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                {downloading === 'excel' ? '⏳ Downloading...' : '⬇️ Download Excel'}
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading === 'pdf'}
                style={{ padding: '10px 20px', background: downloading === 'pdf' ? '#aaa' : '#c0392b', color: '#fff', border: 'none', borderRadius: 8, cursor: downloading === 'pdf' ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                {downloading === 'pdf' ? '⏳ Downloading...' : '⬇️ Download PDF'}
              </button>
            </div>
          </div>

          {reportLoading && (
            <p style={{ color: '#999', fontSize: 13 }}>Loading report summary...</p>
          )}

          {!reportLoading && reportError && (
            <div style={{ padding: '12px 16px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, color: '#c53030', fontSize: 13 }}>
              ⚠️ Reports microservice is offline. Start it with{' '}
              <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>python app.py</code>{' '}
              inside <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>reports-service/</code>.
              Download buttons still work once the service is running.
            </div>
          )}

          {!reportLoading && !reportError && reportSummary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[
                { label: 'Total Orders',     value: reportSummary.total_orders,           icon: '🛒', color: '#3b82f6' },
                { label: 'Items Sold',        value: reportSummary.total_items_sold,        icon: '📦', color: '#10b981' },
                { label: 'Total Revenue',     value: fmt(reportSummary.total_revenue),      icon: '💰', color: '#f59e0b' },
                { label: 'Avg Order Value',   value: fmt(reportSummary.average_order_value),icon: '📈', color: '#8b5cf6' },
              ].map((s) => (
                <div key={s.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '14px 18px', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginTop: 2 }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default ManagerDashboard;
