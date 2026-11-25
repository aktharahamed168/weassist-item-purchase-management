// WeAssist - Static GitHub Pages Demo
// This file uses sample data. It does not connect to MySQL.

const itemTypes = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Furniture" },
    { id: 3, name: "Accessories" }
];

const items = [
    { id: 3, name: "Wireless Mouse", type: "Electronics", stock: 25, active: true },
    { id: 5, name: "Television", type: "Electronics", stock: 0, active: true },
    { id: 6, name: "Office Chair", type: "Furniture", stock: 4, active: true },
    { id: 7, name: "Keyboard", type: "Accessories", stock: 15, active: true },
    { id: 8, name: "Old Laptop", type: "Electronics", stock: 2, active: false }
];

const purchases = [
    {
        id: 1,
        orderId: "ORD-001",
        date: "2026-11-20",
        total: 2500,
        details: [
            { item: "Wireless Mouse", quantity: 2, price: 500 },
            { item: "Keyboard", quantity: 1, price: 1500 }
        ]
    },
    {
        id: 2,
        orderId: "ORD-002",
        date: "2026-11-22",
        total: 4500,
        details: [
            { item: "Office Chair", quantity: 1, price: 4500 }
        ]
    }
];

function showSection(sectionId) {
    document.querySelectorAll("main section").forEach(section => {
        section.hidden = section.id !== sectionId;
    });
}

function renderTable(headers, rows) {
    return `
        <table>
            <thead>
                <tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr>
            </thead>
            <tbody>
                ${rows.map(row => `
                    <tr>${row.map(value => `<td>${value}</td>`).join("")}</tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function renderItemTypes() {
    const rows = itemTypes.map(type => [
        type.id,
        type.name
    ]);

    document.getElementById("typeList").innerHTML =
        renderTable(["ID", "Item Type"], rows);
}

function renderItems() {
    const rows = items.map(item => [
        item.id,
        item.name,
        item.type,
        item.stock,
        item.active ? "Active" : "Inactive"
    ]);

    document.getElementById("itemList").innerHTML =
        renderTable(["ID", "Item Name", "Type", "Stock", "Status"], rows);
}

function renderPurchases() {
    const rows = purchases.map(purchase => [
        purchase.orderId,
        purchase.date,
        "₹" + purchase.total.toLocaleString("en-IN"),
        `<button onclick="showPurchaseDetails(${purchase.id})">View Details</button>`
    ]);

    document.getElementById("purchaseList").innerHTML =
        renderTable(["Order ID", "Date", "Total", "Action"], rows);
}

function showPurchaseDetails(purchaseId) {
    const purchase = purchases.find(p => p.id === purchaseId);

    if (!purchase) return;

    const rows = purchase.details.map(detail => [
        detail.item,
        detail.quantity,
        "₹" + detail.price.toLocaleString("en-IN")
    ]);

    document.getElementById("purchaseDetails").innerHTML = `
        <p><strong>Order ID:</strong> ${purchase.orderId}</p>
        ${renderTable(["Item", "Quantity", "Price"], rows)}
    `;
}

function getStockStatus(stock) {
    if (stock === 0) {
        return '<span class="status out-stock">Out of Stock</span>';
    }

    if (stock <= 5) {
        return '<span class="status low-stock">Low Stock</span>';
    }

    return '<span class="status in-stock">In Stock</span>';
}

function renderStock() {
    const rows = items.map(item => [
        item.name,
        item.stock,
        getStockStatus(item.stock)
    ]);

    document.getElementById("stockList").innerHTML =
        renderTable(["Item Name", "Available Stock", "Availability"], rows);
}

// Load sample data when the page opens
document.addEventListener("DOMContentLoaded", () => {
    renderItemTypes();
    renderItems();
    renderPurchases();
    renderStock();
});
