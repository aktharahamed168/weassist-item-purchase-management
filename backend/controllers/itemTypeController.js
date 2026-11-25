
const db = require("../config/db");

// create a new item type
const createItemType = (req, res) => {
    const { type_name } = req.body;

    if (!type_name || !type_name.trim()) {
        return res.status(400).json({
            success: false,
            message: "item type name is required"
        });
    }

    const sql = "insert into item_types (type_name) values (?)";

    db.query(sql, [type_name.trim()], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "item type already exists"
                });
            }

            return res.status(500).json({
                success: false,
                message: "failed to create item type"
            });
        }

        res.status(201).json({
            success: true,
            message: "item type created successfully",
            id: result.insertId
        });
    });
};

// get all item types
const getAllItemTypes = (req, res) => {
    const sql = "select * from item_types order by id desc";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to retrieve item types"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
};

// update item type
const updateItemType = (req, res) => {
    const { id } = req.params;
    const { type_name } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: "invalid item type id"
        });
    }

    if (!type_name || !type_name.trim()) {
        return res.status(400).json({
            success: false,
            message: "item type name is required"
        });
    }

    const sql = `
        update item_types
        set type_name = ?
        where id = ?
    `;

    db.query(sql, [type_name.trim(), id], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "item type already exists"
                });
            }

            return res.status(500).json({
                success: false,
                message: "failed to update item type"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "item type not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "item type updated successfully"
        });
    });
};

// delete item type
const deleteItemType = (req, res) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: "invalid item type id"
        });
    }

    const checkSql = `
        select id from item_types
        where id = ?
    `;

    db.query(checkSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "failed to check item type"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "item type not found"
            });
        }

        const itemSql = `
            select id from items
            where item_type_id = ?
            limit 1
        `;

        db.query(itemSql, [id], (err, itemResults) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "failed to check related items"
                });
            }

            if (itemResults.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "cannot delete item type because items are using it"
                });
            }

            const deleteSql = `
                delete from item_types
                where id = ?
            `;

            db.query(deleteSql, [id], (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "failed to delete item type"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "item type deleted successfully"
                });
            });
        });
    });
};

module.exports = {
    createItemType,
    getAllItemTypes,
    updateItemType,
    deleteItemType
};
