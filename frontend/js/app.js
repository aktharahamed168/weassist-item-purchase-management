
const apiUrl = "/api/item-types";

// get html elements
const itemTypeForm = document.getElementById("itemTypeForm");
const itemTypeId = document.getElementById("itemTypeId");
const typeName = document.getElementById("typeName");
const itemTypeTableBody = document.getElementById("itemTypeTableBody");
const itemTypeMessage = document.getElementById("itemTypeMessage");
const itemTypeSubmit = document.getElementById("itemTypeSubmit");
const cancelEdit = document.getElementById("cancelEdit");

// display message
function showMessage(message, isSuccess) {
    itemTypeMessage.textContent = message;
    itemTypeMessage.style.color = isSuccess ? "green" : "red";
}

// reset form
function resetForm() {
    itemTypeForm.reset();
    itemTypeId.value = "";
    itemTypeSubmit.textContent = "Add Item Type";
    cancelEdit.hidden = true;
}

// get all item types
async function loadItemTypes() {
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to load item types");
        }

        itemTypeTableBody.innerHTML = "";

        result.data.forEach((itemType) => {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            idCell.textContent = itemType.id;

            const nameCell = document.createElement("td");
            nameCell.textContent = itemType.type_name;

            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.type = "button";
            editButton.addEventListener("click", () => {
                editItemType(itemType);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.style.marginLeft = "8px";

            deleteButton.addEventListener("click", () => {
                deleteItemType(itemType.id);
            });

            actionCell.append(editButton, deleteButton);
            row.append(idCell, nameCell, actionCell);

            itemTypeTableBody.appendChild(row);
        });

    } catch (error) {
        showMessage(error.message, false);
    }
}

// add or update item type
itemTypeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = itemTypeId.value;

    const data = {
        type_name: typeName.value.trim()
    };

    const url = id ? `${apiUrl}/${id}` : apiUrl;
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "operation failed");
        }

        showMessage(result.message, true);

        resetForm();
        await loadItemTypes();
        await loadItemTypeOptions();

    } catch (error) {
        showMessage(error.message, false);
    }
});

// edit item type
function editItemType(itemType) {
    itemTypeId.value = itemType.id;
    typeName.value = itemType.type_name;

    itemTypeSubmit.textContent = "Update Item Type";
    cancelEdit.hidden = false;

    showMessage("editing item type", true);
}

// delete item type
async function deleteItemType(id) {
    const confirmed = confirm("Are you sure you want to delete this item type?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to delete item type");
        }

        showMessage(result.message, true);
        loadItemTypes();

    } catch (error) {
        showMessage(error.message, false);
    }
}

// cancel editing
cancelEdit.addEventListener("click", resetForm);

// navigation
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

navButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const sectionId = button.dataset.section;

        sections.forEach((section) => {
            section.hidden = section.id !== sectionId;
        });

        if (sectionId === "stock") {
            loadStockAvailability();
        }
        if (sectionId === "items") {
            loadItemTypeOptions();
        }
        navButtons.forEach((navButton) => {
            navButton.classList.remove("active");
        });

        button.classList.add("active");
    });
    
});

// load item types when page opens
loadItemTypes();


// item management elements
const itemTypeDropdown = document.getElementById("itemType");

// load item types into item form dropdown
async function loadItemTypeOptions() {
    try {
        const response = await fetch("/api/item-types");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to load item types");
        }

        itemTypeDropdown.innerHTML =
            '<option value="">Select Item Type</option>';

        result.data.forEach((itemType) => {
            const option = document.createElement("option");

            option.value = itemType.id;
            option.textContent = itemType.type_name;

            itemTypeDropdown.appendChild(option);
        });

    } catch (error) {
        console.error("error loading item types:", error.message);
    }
}

// load dropdown when page opens
loadItemTypeOptions();


// item management elements
const itemTableBody = document.getElementById("itemTableBody");
const itemMessage = document.getElementById("itemMessage");

// get and display all items
async function loadItems() {
    try {
        const response = await fetch("/api/items");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to load items");
        }

        itemTableBody.innerHTML = "";

        result.data.forEach((item) => {
            const row = document.createElement("tr");

            const values = [
                item.id,
                item.name,
                item.type_name,
                new Date(item.purchase_date).toLocaleDateString("en-IN"),
                item.stock_available,
                item.availability,
                item.active === 1 ? "Active" : "Inactive"
            ];

            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            
            const actionCell = document.createElement("td");
            
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.type = "button";
            
            editButton.addEventListener("click", () => {
                editItem(item);
            });
            
            actionCell.appendChild(editButton);
            const statusButton = document.createElement("button");

            statusButton.textContent = item.active ? "Deactivate" : "Activate";
            statusButton.type = "button";
            
            statusButton.addEventListener("click", () => {
                toggleItemStatus(item);
            });
            
            actionCell.appendChild(statusButton);
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            
            deleteButton.addEventListener("click", () => {
                deleteItem(item.id);
            });
            
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
            itemTableBody.appendChild(row);
        });

    } catch (error) {
        itemMessage.textContent = error.message;
        itemMessage.style.color = "red";
    }
}

// load items when page opens
loadItems();

// edit item
function editItem(item) {
    itemId.value = item.id;
    itemName.value = item.name;
    itemTypeDropdown.value = item.item_type_id;
    purchaseDate.value = item.purchase_date;
    stockAvailable.value = item.stock_available;
    itemActive.value = String(item.active);

    itemSubmit.textContent = "Update Item";
    cancelItemEdit.hidden = false;

    itemMessage.textContent = "Editing item";
    itemMessage.style.color = "green";
}

async function toggleItemStatus(item) {
    const data = {
        name: item.name,
        item_type_id: item.item_type_id,
        purchase_date: item.purchase_date,
        stock_available: item.stock_available,
        active: !item.active
    };

    try {
        const response = await fetch(`/api/items/${item.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to update status");
        }

        await loadItems();

    } catch (error) {
        alert(error.message);
    }
}

async function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this item?")) {
        return;
    }

    try {
        const response = await fetch(`/api/items/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to delete item");
        }

        alert(result.message);
        await loadItems();

    } catch (error) {
        alert(error.message);
    }
}

// item form elements
const itemForm = document.getElementById("itemForm");
const itemId = document.getElementById("itemId");
const itemName = document.getElementById("itemName");
const purchaseDate = document.getElementById("purchaseDate");
const stockAvailable = document.getElementById("stockAvailable");
const itemActive = document.getElementById("itemActive");
const itemSubmit = document.getElementById("itemSubmit");
const cancelItemEdit = document.getElementById("cancelItemEdit");

cancelItemEdit.addEventListener("click", () => {
    itemForm.reset();

    itemId.value = "";
    itemSubmit.textContent = "Add Item";
    cancelItemEdit.hidden = true;

    itemMessage.textContent = "";
});

// add item

itemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = itemId.value;

    const data = {
        name: itemName.value.trim(),
        item_type_id: Number(itemTypeDropdown.value),
        purchase_date: purchaseDate.value,
        stock_available: Number(stockAvailable.value),
        active: itemActive.value === "1"
    };

    const url = id ? `/api/items/${id}` : "/api/items";
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "operation failed");
        }

        itemMessage.textContent = result.message;
        itemMessage.style.color = "green";

        itemForm.reset();
        itemId.value = "";
        itemSubmit.textContent = "Add Item";
        cancelItemEdit.hidden = true;

        await loadItems();

    } catch (error) {
        itemMessage.textContent = error.message;
        itemMessage.style.color = "red";
    }
});

const purchaseForm = document.getElementById("purchaseForm");
const orderIdInput = document.getElementById("orderId");
const purchaseDateInput = document.getElementById("purchasePurchaseDate");
const purchaseMessage = document.getElementById("purchaseMessage");

purchaseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const rows = purchaseItemsContainer.querySelectorAll(".purchase-item-row");

    const items = [];

    rows.forEach(row => {
        items.push({
            item_id: Number(row.querySelector("select").value),
            quantity: Number(row.querySelector("input").value)
        });
    });

    const data = {
        order_id: orderIdInput.value.trim(),
        purchase_date: purchaseDateInput.value,
        items: items
    };

    console.log("purchase data:", data);

    try {
        const response = await fetch("/api/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to create purchase");
        }

        purchaseMessage.textContent = result.message;
        purchaseMessage.style.color = "green";

        purchaseForm.reset();
        purchaseItemsContainer.innerHTML = "";

        await loadItems();
        await loadPurchases();
    } catch (error) {
        purchaseMessage.textContent = error.message;
        purchaseMessage.style.color = "red";
    }
});


const purchaseItemsContainer = document.getElementById("purchaseItemsContainer");
const addPurchaseItemButton = document.getElementById("addPurchaseItem");

async function addPurchaseItemRow() {
    try {
        const response = await fetch("/api/items");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to load items");
        }

        const activeItems = result.data.filter(item => Number(item.active) === 1);

        if (activeItems.length === 0) {
            alert("No active items available");
            return;
        }

        const row = document.createElement("div");
        row.className = "purchase-item-row";

        const itemSelect = document.createElement("select");
        itemSelect.required = true;
        itemSelect.innerHTML = '<option value="">Select Item</option>';

        activeItems.forEach(item => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = `${item.name} (Stock: ${item.stock_available})`;
            itemSelect.appendChild(option);
        });

        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.placeholder = "Quantity";
        quantityInput.required = true;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            row.remove();
        });

        row.append(itemSelect, quantityInput, removeButton);
        purchaseItemsContainer.appendChild(row);

    } catch (error) {
        alert(error.message);
    }
}

addPurchaseItemButton.addEventListener("click", addPurchaseItemRow);


const purchaseTableBody = document.getElementById("purchaseTableBody");

async function loadPurchases() {
    try {
        const response = await fetch("/api/purchases");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to load purchases");
        }

        purchaseTableBody.innerHTML = "";

        const purchases = new Map();

        result.data.forEach(purchase => {
            if (!purchases.has(purchase.purchase_id)) {
                purchases.set(purchase.purchase_id, purchase);
            }
        });

        purchases.forEach(purchase => {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            idCell.textContent = purchase.purchase_id;

            const orderCell = document.createElement("td");
            orderCell.textContent = purchase.order_id;

            const dateCell = document.createElement("td");
            dateCell.textContent = new Date(
                purchase.purchase_date
            ).toLocaleDateString("en-IN");

            const actionCell = document.createElement("td");

            const viewButton = document.createElement("button");
            viewButton.textContent = "View Details";
            viewButton.addEventListener("click", () => {
                viewPurchaseDetails(purchase.purchase_id);
            });
            
            const updateButton = document.createElement("button");
            updateButton.textContent = "Update";
            updateButton.addEventListener("click", () => {
                updatePurchase(purchase.purchase_id);
            });
            
            actionCell.appendChild(viewButton);
            actionCell.appendChild(updateButton);

            row.append(idCell, orderCell, dateCell, actionCell);

            purchaseTableBody.appendChild(row);
        });

    } catch (error) {
        purchaseMessage.textContent = error.message;
        purchaseMessage.style.color = "red";
    }
}

loadPurchases();

async function viewPurchaseDetails(purchaseId) {
    const purchaseDetails = document.getElementById("purchaseDetails");

    try {
        const response = await fetch(`/api/purchases/${purchaseId}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to load purchase details");
        }

        const purchase = result.data;

        if (!purchase || purchase.length === 0) {
            purchaseDetails.textContent = "No purchase details found.";
            return;
        }

        let html = `
            <p><strong>Order ID:</strong> ${purchase[0].order_id}</p>
            <p><strong>Purchase Date:</strong> ${new Date(purchase[0].purchase_date).toLocaleDateString("en-IN")}</p>

            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Item Type</th>
                        <th>Quantity</th>
                        <th>Current Stock</th>
                        <th>Availability</th>
                    </tr>
                </thead>
                <tbody>
        `;

        purchase.forEach(item => {
            html += `
                <tr>
                    <td>${item.item_name}</td>
                    <td>${item.type_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.stock_available}</td>
                    <td>${item.availability}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        purchaseDetails.innerHTML = html;

    } catch (error) {
        purchaseDetails.textContent = error.message;
    }
}

async function updatePurchase(purchaseId) {
    const container = document.getElementById("updatePurchaseFormContainer");

    try {
        const response = await fetch(`/api/purchases/${purchaseId}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to load purchase");
        }

        const purchase = result.data;

        container.hidden = false;

        container.innerHTML = `
            <h3>Update Purchase</h3>

            <form id="editPurchaseForm">
                <label>Order ID</label>
                <input
                    type="text"
                    id="editOrderId"
                    value="${purchase[0].order_id}"
                    required
                >

                <label>Purchase Date</label>
                <input
                    type="date"
                    id="editPurchaseDate"
                    value="${purchase[0].purchase_date.substring(0, 10)}"
                    required
                >

                <h4>Purchase Items</h4>

                <div id="editPurchaseItems"></div>

                <button type="button" id="addEditPurchaseItem">
                    + Add Item
                </button>

                <br><br>

                <button type="submit">Save Changes</button>

                <button type="button" id="cancelPurchaseUpdate">
                    Cancel
                </button>

                <p id="editPurchaseMessage"></p>
            </form>
        `;
        const itemsContainer = document.getElementById("editPurchaseItems");
const addButton = document.getElementById("addEditPurchaseItem");

const itemsResponse = await fetch("/api/items");
const itemsResult = await itemsResponse.json();

if (!itemsResponse.ok) {
    throw new Error("Failed to load items");
}

const availableItems = itemsResult.data;

function addEditPurchaseItemRow(itemId = "", quantity = "") {
    const row = document.createElement("div");
    row.className = "purchase-item-row";

    const select = document.createElement("select");
    select.required = true;
    select.innerHTML = '<option value="">Select Item</option>';

    availableItems.forEach(item => {
        const isSelectedItem = Number(item.id) === Number(itemId);

        if (Number(item.active) === 1 || isSelectedItem) {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = `${item.name} (Stock: ${item.stock_available})`;
            option.selected = isSelectedItem;
            select.appendChild(option);
        }
    });

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.required = true;
    quantityInput.placeholder = "Quantity";
    quantityInput.value = quantity;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => row.remove());

    row.append(select, quantityInput, removeButton);
    itemsContainer.appendChild(row);
}

purchase.forEach(item => {
    addEditPurchaseItemRow(item.item_id, item.quantity);
});

addButton.addEventListener("click", () => {
    addEditPurchaseItemRow();
});
const editForm = document.getElementById("editPurchaseForm");

editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const rows = itemsContainer.querySelectorAll(".purchase-item-row");

    const updatedItems = [];

    rows.forEach(row => {
        updatedItems.push({
            item_id: Number(row.querySelector("select").value),
            quantity: Number(row.querySelector("input").value)
        });
    });

    const data = {
        order_id: document.getElementById("editOrderId").value.trim(),
        purchase_date: document.getElementById("editPurchaseDate").value,
        items: updatedItems
    };

    try {
    const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    const message = document.getElementById("editPurchaseMessage");

    if (!response.ok) {
        throw new Error(result.message || "Failed to update purchase");
    }

    message.textContent = result.message;
    message.style.color = "green";

    await loadItems();
    await loadPurchases();
    await viewPurchaseDetails(purchaseId);

    setTimeout(() => {
        container.hidden = true;
        container.innerHTML = "";
    }, 1000);

} catch (error) {
    const message = document.getElementById("editPurchaseMessage");
    message.textContent = error.message;
    message.style.color = "red";
}
});

document.getElementById("cancelPurchaseUpdate").addEventListener("click", () => {
    container.hidden = true;
    container.innerHTML = "";
});
    } catch (error) {
        alert(error.message);
    }
}

const stockTableBody = document.getElementById("stockTableBody");

async function loadStockAvailability() {
    try {
        const response = await fetch("/api/items");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "failed to load stock");
        }

        stockTableBody.innerHTML = "";

        result.data.forEach(item => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = item.name;

            const typeCell = document.createElement("td");
            typeCell.textContent = item.type_name;

            const stockCell = document.createElement("td");
            stockCell.textContent = item.stock_available;

            const availabilityCell = document.createElement("td");
            availabilityCell.textContent =
                Number(item.stock_available) > 0
                    ? "In Stock"
                    : "Out of Stock";

            row.append(
                nameCell,
                typeCell,
                stockCell,
                availabilityCell
            );

            stockTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("stock loading error:", error);
    }
}

loadStockAvailability();