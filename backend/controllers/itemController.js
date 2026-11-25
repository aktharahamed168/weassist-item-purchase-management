
const db = require("../config/db");

// create a new item
const createItem = (req, res) => {
    const {
        name,
        item_type_id,
        purchase_date,
        stock_available,
        active
    } = req.body;

    // validate required fields
    if (
        !name ||
        !name.trim() ||
        !item_type_id ||
        !purchase_date ||
        stock_available === undefined ||
        active === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "all item fields are required"
        });
    }

    // validate stock
    if (
        !Number.isInteger(Number(stock_available)) ||
        Number(stock_available) < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "stock available must be a non-negative integer"
        });
    }

    // validate active status
    if (![true, false, 0, 1].includes(active)) {
        return res.status(400).json({
            success: false,
            message: "active status must be true or false"
        });
    }

    // validate purchase date
    if (
        typeof purchase_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(purchase_date) ||
        Number.isNaN(Date.parse(purchase_date))
    ) {
        return res.status(400).json({
            success: false,
            message: "enter a valid purchase date"
        });
    }

    // check whether item type exists
    const checkSql = "select id from item_types where id = ?";

    db.query(checkSql, [item_type_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to validate item type"
            });
        }

        if (results.length === 0) {
            return res.status(400).json({
                success: false,
                message: "invalid item type"
            });
        }

        // insert item
        const sql = `
            insert into items
            (name, item_type_id, purchase_date, stock_available, active)
            values (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                name.trim(),
                item_type_id,
                purchase_date,
                Number(stock_available),
                active === true || active === 1 ? 1 : 0
            ],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "failed to create item"
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "item created successfully",
                    id: result.insertId
                });
            }
        );
    });
};

// get all items with item type
const getAllItems = (req, res) => {
    const sql = `
        select
            i.id,
            i.name,
            i.item_type_id,
            it.type_name,
            date_format(i.purchase_date, '%Y-%m-%d') as purchase_date,
            i.stock_available,
            case
                when i.stock_available > 0 then 'in stock'
                else 'out of stock'
            end as availability,
            i.active
        from items i
        join item_types it on i.item_type_id = it.id
        order by i.id desc
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to retrieve items"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
};

 // get item details by id
const getItemById = (req, res) => {
    const { id } = req.params;

    // validate item id
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: "invalid item id"
        });
    }

    const sql = `
        select
            i.id,
            i.name,
            i.item_type_id,
            it.type_name,
            date_format(i.purchase_date, '%Y-%m-%d') as purchase_date,
            i.stock_available,
            case
                when i.stock_available > 0 then 'in stock'
                else 'out of stock'
            end as availability,
            i.active
        from items i
        join item_types it on i.item_type_id = it.id
        where i.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to retrieve item details"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "item not found"
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};


// update item
const updateItem = (req, res) => {
    const { id } = req.params;

    const {
        name,
        item_type_id,
        purchase_date,
        stock_available,
        active
    } = req.body;

    // validate item id
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: "invalid item id"
        });
    }

    // validate required fields
    if (
        !name ||
        !name.trim() ||
        !item_type_id ||
        !purchase_date ||
        stock_available === undefined ||
        active === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "all item fields are required"
        });
    }

    // validate stock
    if (
        !Number.isInteger(Number(stock_available)) ||
        Number(stock_available) < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "stock available must be a non-negative integer"
        });
    }

    // validate active status
    if (![true, false, 0, 1].includes(active)) {
        return res.status(400).json({
            success: false,
            message: "active status must be true or false"
        });
    }

    // validate purchase date
    if (
        typeof purchase_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(purchase_date) ||
        Number.isNaN(Date.parse(purchase_date))
    ) {
        return res.status(400).json({
            success: false,
            message: "enter a valid purchase date"
        });
    }

    // check whether item exists
    const checkItemSql = "select id from items where id = ?";

    db.query(checkItemSql, [id], (err, itemResults) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to check item"
            });
        }

        if (itemResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "item not found"
            });
        }

        // check whether item type exists
        const checkTypeSql = "select id from item_types where id = ?";

        db.query(checkTypeSql, [item_type_id], (err, typeResults) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "failed to validate item type"
                });
            }

            if (typeResults.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "invalid item type"
                });
            }

            // update item
            const sql = `
                update items
                set name = ?,
                    item_type_id = ?,
                    purchase_date = ?,
                    stock_available = ?,
                    active = ?
                where id = ?
            `;

            db.query(
                sql,
                [
                    name.trim(),
                    item_type_id,
                    purchase_date,
                    Number(stock_available),
                    active === true || active === 1 ? 1 : 0,
                    id
                ],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "failed to update item"
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: "item updated successfully"
                    });
                }
            );
        });
    });
};

// delete an item
const deleteItem = (req, res) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: "invalid item id"
        });
    }

    // check whether the item exists
    const checkItemSql = "select id from items where id = ?";

    db.query(checkItemSql, [id], (err, itemResult) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to check item"
            });
        }

        if (itemResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "item not found"
            });
        }

        // check whether the item has purchase history
        const checkPurchaseSql =
            "select id from purchase_items where item_id = ? limit 1";

        db.query(checkPurchaseSql, [id], (err, purchaseResult) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "failed to check purchase history"
                });
            }

            // if purchase history exists, mark item inactive
            if (purchaseResult.length > 0) {
                const updateSql = "update items set active = false where id = ?";

                db.query(updateSql, [id], (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "failed to deactivate item"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "item has purchase history, so it was marked inactive"
                    });
                });
            } else {
                // physically delete item if no purchase history exists
                const deleteSql = "delete from items where id = ?";

                db.query(deleteSql, [id], (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "failed to delete item"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "item deleted successfully"
                    });
                });
            }
        });
    });
};
module.exports = {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
};

