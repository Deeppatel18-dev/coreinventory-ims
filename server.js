const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Default Route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

// --- 1. AUTHENTICATION ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (row) res.json({ success: true });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    });
});

// --- 2. PRODUCTS ---
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => res.json(rows));
});

app.post('/api/products', (req, res) => {
    const { name, sku, category, unit, stock } = req.body;
    db.run("INSERT INTO products (name, sku, category, unit, stock) VALUES (?,?,?,?,?)", 
    [name, sku, category, unit, stock], () => res.json({ success: true }));
});

// --- 3. RECEIPTS (Stock Vadhashe) ---
app.get('/api/receipts', (req, res) => {
    db.all("SELECT * FROM receipts", [], (err, rows) => res.json(rows));
});

app.post('/api/receipts', (req, res) => {
    const { vendor, product, quantity, warehouse, date } = req.body;
    db.run("INSERT INTO receipts (vendor, product, quantity, warehouse, date) VALUES (?,?,?,?,?)", 
    [vendor, product, quantity, warehouse, date], () => {
        db.run("UPDATE products SET stock = stock + ? WHERE name = ?", [quantity, product]);
        res.json({ success: true });
    });
});

// --- 4. DELIVERIES (Stock Ghatshe) ---
app.get('/api/deliveries', (req, res) => {
    db.all("SELECT * FROM deliveries", [], (err, rows) => res.json(rows));
});

app.post('/api/deliveries', (req, res) => {
    const { customer, product, quantity, warehouse, date } = req.body;
    db.run("INSERT INTO deliveries (customer, product, quantity, warehouse, date) VALUES (?,?,?,?,?)", 
    [customer, product, quantity, warehouse, date], () => {
        db.run("UPDATE products SET stock = stock - ? WHERE name = ?", [quantity, product]);
        res.json({ success: true });
    });
});

// --- 5. TRANSFERS ---
app.get('/api/transfers', (req, res) => {
    db.all("SELECT * FROM transfers", [], (err, rows) => res.json(rows));
});

app.post('/api/transfers', (req, res) => {
    const { product, quantity, from_wh, to_wh, date } = req.body;
    db.run("INSERT INTO transfers (product, quantity, from_wh, to_wh, date) VALUES (?,?,?,?,?)", 
    [product, quantity, from_wh, to_wh, date], () => res.json({ success: true }));
});

// --- 6. ADJUSTMENTS (Stock Sync thashe) ---
app.get('/api/adjustments', (req, res) => {
    db.all("SELECT * FROM adjustments", [], (err, rows) => res.json(rows));
});

app.post('/api/adjustments', (req, res) => {
    const { product, warehouse, system_qty, actual_qty, reason, date } = req.body;
    db.run("INSERT INTO adjustments (product, warehouse, system_qty, actual_qty, reason, date) VALUES (?,?,?,?,?,?)", 
    [product, warehouse, system_qty, actual_qty, reason, date], () => {
        db.run("UPDATE products SET stock = ? WHERE name = ?", [actual_qty, product]);
        res.json({ success: true });
    });
});

// --- 7. WAREHOUSES ---
app.get('/api/warehouses', (req, res) => {
    db.all("SELECT * FROM warehouses", [], (err, rows) => res.json(rows));
});

app.post('/api/warehouses', (req, res) => {
    const { name, location, manager } = req.body;
    db.run("INSERT INTO warehouses (name, location, manager) VALUES (?,?,?)", 
    [name, location, manager], () => res.json({ success: true }));
});

// --- 8. DASHBOARD STATS ---
app.get('/api/stats', (req, res) => {
    db.get("SELECT COUNT(*) as p FROM products", (err, pRow) => {
        db.get("SELECT COUNT(*) as r FROM receipts", (err, rRow) => {
            db.get("SELECT COUNT(*) as d FROM deliveries", (err, dRow) => {
                db.get("SELECT COUNT(*) as l FROM products WHERE stock < 10", (err, lRow) => {
                    res.json({ products: pRow.p, receipts: rRow.r, deliveries: dRow.d, lowStock: lRow.l });
                });
            });
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(` Server running: http://localhost:${PORT}`));