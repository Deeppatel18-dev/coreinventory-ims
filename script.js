// --- 1. PAGE LOAD LOGIC ---
// Jyare koi pan page load thay, tyare te page mujab no data fetch karva mate
window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('dashboard.html')) loadDashboardStats();
    if (path.includes('products.html')) loadProducts();
    if (path.includes('receipts.html')) loadReceipts();
    if (path.includes('delivery.html')) loadDeliveries();
    if (path.includes('transfer.html')) loadTransfers();
    if (path.includes('adjustment.html')) loadAdjustments();
    if (path.includes('warehouse1.html')) loadWarehouses();
    if (path.includes('history.html')) loadHistory();
});

// --- 2. AUTHENTICATION (Login) ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) window.location.href = "dashboard.html";
    else alert("Invalid Credentials!");
}

// --- 3. DASHBOARD STATS ---
async function loadDashboardStats() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (document.getElementById('totalP')) document.getElementById('totalP').innerText = data.products;
    if (document.getElementById('lowStock')) document.getElementById('lowStock').innerText = data.lowStock;
    if (document.getElementById('totalR')) document.getElementById('totalR').innerText = data.receipts;
    if (document.getElementById('totalD')) document.getElementById('totalD').innerText = data.deliveries;
}

// --- 4. PRODUCTS ---
async function loadProducts() {
    const res = await fetch('/api/products');
    const data = await res.json();
    renderTable(data, ['name', 'sku', 'category', 'unit', 'stock']);
}

async function addProduct() {
    const payload = {
        name: document.getElementById('pName').value,
        sku: document.getElementById('pSku').value,
        category: document.getElementById('pCat').value,
        unit: document.getElementById('pUnit').value,
        stock: document.getElementById('pStock').value
    };
    await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert("Product Added!");
    loadProducts();
}

// --- 5. RECEIPTS ---
async function loadReceipts() {
    const res = await fetch('/api/receipts');
    const data = await res.json();
    renderTable(data, ['date', 'vendor', 'product', 'quantity', 'warehouse']);
}

async function addReceipt() {
    const payload = {
        vendor: document.getElementById('rVendor').value,
        product: document.getElementById('rProduct').value,
        quantity: document.getElementById('rQty').value,
        warehouse: document.getElementById('rWh').value,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
    await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert("Stock Received!");
    loadReceipts();
}

// --- 6. DELIVERIES ---
async function loadDeliveries() {
    const res = await fetch('/api/deliveries');
    const data = await res.json();
    renderTable(data, ['date', 'customer', 'product', 'quantity', 'warehouse']);
}

async function addDelivery() {
    const payload = {
        customer: document.getElementById('dCustomer').value,
        product: document.getElementById('dProduct').value,
        quantity: document.getElementById('dQty').value,
        warehouse: document.getElementById('dWh').value,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
    await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert("Delivery Created!");
    loadDeliveries();
}

// --- 7. TRANSFERS ---
async function loadTransfers() {
    const res = await fetch('/api/transfers');
    const data = await res.json();
    renderTable(data, ['date', 'product', 'quantity', 'from_wh', 'to_wh']);
}

async function addTransfer() {
    const payload = {
        product: document.getElementById('tProduct').value,
        quantity: document.getElementById('tQty').value,
        from_wh: document.getElementById('tFromWh').value,
        to_wh: document.getElementById('tToWh').value,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
    await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert("Transfer Successful!");
    loadTransfers();
}

// --- 8. ADJUSTMENTS ---
async function loadAdjustments() {
    const res = await fetch('/api/adjustments');
    const data = await res.json();
    renderTable(data, ['date', 'product', 'warehouse', 'system_qty', 'actual_qty', 'reason']);
}

async function addAdjustment() {
    const payload = {
        product: document.getElementById('aProduct').value,
        warehouse: document.getElementById('aWh').value,
        system_qty: document.getElementById('aSysQty').value,
        actual_qty: document.getElementById('aActQty').value,
        reason: document.getElementById('aReason').value,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
    await fetch('/api/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert("Stock Adjusted!");
    loadAdjustments();
}

// --- 9. WAREHOUSES ---
async function loadWarehouses() {
    const res = await fetch('/api/warehouses');
    const data = await res.json();
    renderTable(data, ['name', 'location', 'manager']);
}

async function addWarehouse() {
    const payload = {
        name: document.getElementById('wName').value,
        location: document.getElementById('wLoc').value,
        manager: document.getElementById('wMgr').value
    };
    await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert("Warehouse Added!");
    loadWarehouses();
}

// --- UTILITY: Reusable Table Renderer ---
function renderTable(data, keys) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    data.forEach(item => {
        let row = "<tr>";
        keys.forEach(key => {
            row += `<td>${item[key] || '-'}</td>`;
        });
        // Warehouse page mate actions button add karva (optional)
        if (keys.includes('manager')) {
            row += `<td><button class="edit-btn">Edit</button><button class="delete-btn">Delete</button></td>`;
        }
        row += "</tr>";
        tbody.innerHTML += row;
    });
}