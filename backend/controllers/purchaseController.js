const db = require("../config/db");

// create a new purchase
const createPurchase = (req, res) => {
 const { order_id, purchase_date, items } = req.body;

    // validate purchase details
    if (!order_id || !order_id.trim() || !purchase_date || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "order id, purchase date and at least one item are required"
        });
    }

    // validate purchase date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(purchase_date) ||
        !Number.isFinite(Date.parse(purchase_date)) ||
        new Date(purchase_date).toISOString().slice(0, 10) !== purchase_date) {
        return res.status(400).json({
            success: false,
            message: "invalid purchase date"
        });
    }

    // validate item quantities and duplicate items
    const itemIds = new Set();

    for (const item of items) {
        if (
            !Number.isInteger(Number(item.item_id)) ||
            Number(item.item_id) <= 0 ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "each item must have a valid item id and positive quantity"
            });
        }

        if (itemIds.has(Number(item.item_id))) {
            return res.status(400).json({
                success: false,
                message: "duplicate items are not allowed"
            });
        }

        itemIds.add(Number(item.item_id));
    }

    // begin database transaction
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to start purchase transaction"
            });
        }

        const rollback = (status, message) => {
            db.rollback(() => {
                res.status(status).json({
                    success: false,
                    message
                });
            });
        };

        // validate all items and lock their stock rows
        const itemList = items.map(item => Number(item.item_id));

        const placeholders = itemList.map(() => "?").join(",");

        const checkSql = `
            select id, stock_available, active
            from items
            where id in (${placeholders})
            order by id
            for update
        `;

        db.query(checkSql, itemList, (err, results) => {
            if (err) {
                return rollback(500, "failed to validate items");
            }

            if (results.length !== items.length) {
                return rollback(404, "one or more items were not found");
            }

            const itemMap = new Map(
                results.map(item => [item.id, item])
            );

            for (const item of items) {
                const selectedItem = itemMap.get(Number(item.item_id));

                if (!selectedItem.active) {
                    return rollback(400, "inactive items cannot be purchased");
                }

                if (Number(item.quantity) > selectedItem.stock_available) {
                    return rollback(409, "insufficient stock for item id " + item.item_id);
                }
            }

            // create purchase record
            const purchaseSql = `
                insert into purchases (order_id, purchase_date)
                values (?, ?)
            `;

            db.query(
                purchaseSql,
                [order_id.trim(), purchase_date],
                (err, purchaseResult) => {
                    if (err) {
                        if (err.code === "ER_DUP_ENTRY") {
                            return rollback(409, "order id already exists");
                        }

                        return rollback(500, "failed to create purchase");
                    }

                    const purchaseId = purchaseResult.insertId;

                    // insert purchase items one by one
                    const insertNextItem = (index) => {
                        if (index === items.length) {
                            return db.commit((err) => {
                                if (err) {
                                    return rollback(500, "failed to complete purchase");
                                }

                                res.status(201).json({
                                    success: true,
                                    message: "purchase created successfully",
                                    purchase_id: purchaseId,
                                    order_id: order_id.trim()
                                });
                            });
                        }

                        const item = items[index];

                        const insertSql = `
                            insert into purchase_items
                            (purchase_id, item_id, quantity)
                            values (?, ?, ?)
                        `;

                        db.query(
                            insertSql,
                            [purchaseId, item.item_id, item.quantity],
                            (err) => {
                                if (err) {
                                    return rollback(500, "failed to save purchase items");
                                }

                                // deduct purchased quantity from stock
                                const updateStockSql = `
                                    update items
                                    set stock_available = stock_available - ?
                                    where id = ?
                                `;

                                db.query(
                                    updateStockSql,
                                    [item.quantity, item.item_id],
                                    (err) => {
                                        if (err) {
                                            return rollback(500, "failed to update item stock");
                                        }

                                        insertNextItem(index + 1);
                                    }
                                );
                            }
                        );
                    };

                    insertNextItem(0);
                }
            );
        });
    });
};

// get all purchases
const getAllPurchases = (req, res) => {
  const sql = `
        select
            p.id as purchase_id,
            p.order_id,
            p.purchase_date,
            i.id as item_id,
            i.name as item_name,
            it.type_name,
            pi.quantity
        from purchases p
        join purchase_items pi
            on p.id = pi.purchase_id
        join items i
            on pi.item_id = i.id
        join item_types it
            on i.item_type_id = it.id
        order by p.id desc
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to retrieve purchases"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
};

// get purchase details
const getPurchaseById = (req, res) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: "invalid purchase id"
        });
    }

    const sql = `
        select
            p.id as purchase_id,
            p.order_id,
            p.purchase_date,
            i.id as item_id,
            i.name as item_name,
            it.type_name,
            pi.quantity,
            i.stock_available,
            case
                when i.stock_available > 0 then 'in stock'
                else 'out of stock'
            end as availability
        from purchases p
        join purchase_items pi
            on p.id = pi.purchase_id
        join items i
            on pi.item_id = i.id
        join item_types it
            on i.item_type_id = it.id
        where p.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to retrieve purchase details"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "purchase not found"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
};


// update a purchase
const updatePurchase = (req, res) => {
 const { id } = req.params;
    const { order_id, purchase_date, items } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: "invalid purchase id"
        });
    }

    if (
        !order_id ||
        !order_id.trim() ||
        !purchase_date ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            success: false,
            message: "order id, purchase date and items are required"
        });
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(purchase_date) ||
        !Number.isFinite(Date.parse(purchase_date)) ||
        new Date(purchase_date).toISOString().slice(0, 10) !== purchase_date
    ) {
        return res.status(400).json({
            success: false,
            message: "invalid purchase date"
        });
    }

    const itemIds = new Set();

    for (const item of items) {
        if (
            !Number.isInteger(Number(item.item_id)) ||
            Number(item.item_id) <= 0 ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "invalid item id or quantity"
            });
        }

        if (itemIds.has(Number(item.item_id))) {
            return res.status(400).json({
                success: false,
                message: "duplicate items are not allowed"
            });
        }

        itemIds.add(Number(item.item_id));
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to start transaction"
            });
        }

        const rollback = (status, message) => {
            db.rollback(() => {
                res.status(status).json({
                    success: false,
                    message
                });
            });
        };

        // get existing purchase
        const purchaseSql = `
            select id, order_id
            from purchases
            where id = ?
            for update
        `;

        db.query(purchaseSql, [id], (err, purchaseResult) => {
            if (err) {
                return rollback(500, "failed to retrieve purchase");
            }

            if (purchaseResult.length === 0) {
                return rollback(404, "purchase not found");
            }

            if (purchaseResult[0].order_id !== order_id.trim()) {
                const duplicateSql = `
                    select id from purchases
                    where order_id = ? and id != ?
                `;

                db.query(
                    duplicateSql,
                    [order_id.trim(), id],
                    (err, duplicateResult) => {
                        if (err) {
                            return rollback(500, "failed to validate order id");
                        }

                        if (duplicateResult.length > 0) {
                            return rollback(409, "order id already exists");
                        }

                        processPurchase();
                    }
                );
            } else {
                processPurchase();
            }

            function processPurchase() {
                // get previous purchase items
                const oldItemsSql = `
                    select item_id, quantity
                    from purchase_items
                    where purchase_id = ?
                `;

                db.query(oldItemsSql, [id], (err, oldItems) => {
                    if (err) {
                        return rollback(500, "failed to retrieve previous items");
                    }

                    const oldMap = new Map(
                        oldItems.map(item => [
                            item.item_id,
                            item.quantity
                        ])
                    );

                    const allItemIds = [
                        ...new Set([
                            ...oldItems.map(item => item.item_id),
                            ...items.map(item => Number(item.item_id))
                        ])
                    ];

                    const placeholders = allItemIds.map(() => "?").join(",");

                    const stockSql = `
                        select id, stock_available, active
                        from items
                        where id in (${placeholders})
                        order by id
                        for update
                    `;

                    db.query(stockSql, allItemIds, (err, stockResults) => {
                        if (err) {
                            return rollback(500, "failed to check stock");
                        }

                        if (stockResults.length !== allItemIds.length) {
                            return rollback(404, "one or more items were not found");
                        }

                        const stockMap = new Map(
                            stockResults.map(item => [
                                item.id,
                                item
                            ])
                        );

                        // validate new quantities against adjusted stock
                        for (const item of items) {
                            const itemId = Number(item.item_id);
                            const stockItem = stockMap.get(itemId);
                            const oldQuantity = oldMap.get(itemId) || 0;

                            const availableStock =
                                stockItem.stock_available + oldQuantity;

                            if (!stockItem.active) {
                                return rollback(
                                    400,
                                    "inactive items cannot be purchased"
                                );
                            }

                            if (Number(item.quantity) > availableStock) {
                                return rollback(
                                    409,
                                    "insufficient stock for item id " + itemId
                                );
                            }
                        }

                        // update purchase header
                        const updatePurchaseSql = `
                            update purchases
                            set order_id = ?, purchase_date = ?
                            where id = ?
                        `;

                        db.query(
                            updatePurchaseSql,
                            [order_id.trim(), purchase_date, id],
                            (err) => {
                                if (err) {
                                    return rollback(500, "failed to update purchase");
                                }

                                // remove previous purchase item rows
                                const deleteItemsSql = `
                                    delete from purchase_items
                                    where purchase_id = ?
                                `;

                                db.query(deleteItemsSql, [id], (err) => {
                                    if (err) {
                                        return rollback(500, "failed to update purchase items");
                                    }

                                    // restore old quantities to stock
                                    const restoreStock = (index) => {
                                        if (index === oldItems.length) {
                                            return insertUpdatedItems(0);
                                        }

                                        const oldItem = oldItems[index];

                                        const restoreSql = `
                                            update items
                                            set stock_available = stock_available + ?
                                            where id = ?
                                        `;

                                        db.query(
                                            restoreSql,
                                            [oldItem.quantity, oldItem.item_id],
                                            (err) => {
                                                if (err) {
                                                    return rollback(500, "failed to restore stock");
                                                }

                                                restoreStock(index + 1);
                                            }
                                        );
                                    };

                                    // insert new purchase items and deduct stock
                                    const insertUpdatedItems = (index) => {
                                        if (index === items.length) {
                                            return db.commit((err) => {
                                                if (err) {
                                                    return rollback(500, "failed to complete purchase update");
                                                }

                                                res.status(200).json({
                                                    success: true,
                                                    message: "purchase updated successfully"
                                                });
                                            });
                                        }

                                        const item = items[index];

                                        const insertSql = `
                                            insert into purchase_items
                                            (purchase_id, item_id, quantity)
                                            values (?, ?, ?)
                                        `;

                                        db.query(
                                            insertSql,
                                            [id, item.item_id, item.quantity],
                                            (err) => {
                                                if (err) {
                                                    return rollback(500, "failed to update purchase items");
                                                }

                                                const deductSql = `
                                                    update items
                                                    set stock_available = stock_available - ?
                                                    where id = ?
                                                `;

                                                db.query(
                                                    deductSql,
                                                    [item.quantity, item.item_id],
                                                    (err) => {
                                                        if (err) {
                                                            return rollback(500, "failed to deduct stock");
                                                        }

                                                        insertUpdatedItems(index + 1);
                                                    }
                                                );
                                            }
                                        );
                                    };

                                    restoreStock(0);
                                });
                            }
                        );
                    });
                });
            }
        });
    });
};

module.exports = {
    createPurchase,
    getAllPurchases,
    getPurchaseById,
    updatePurchase
};