// 1. IMPORTS
const express = require("express");
const cors = require("cors");

// 2. CREATE APP
const app = express();

// 3. MIDDLEWARES
app.use(cors());
app.use(express.json());

// 4. ROUTES
const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const customerRoutes = require("./src/routes/customer.routes");
const supplierRoutes = require("./src/routes/supplier.routes");
const salesRoutes = require("./src/routes/sales.routes");
const purchaseRoutes = require("./src/routes/purchase.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const requestRoutes = require("./src/routes/request.routes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/requests", requestRoutes);

// 5. START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});