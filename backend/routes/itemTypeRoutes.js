
const express = require("express");

const router = express.Router();

const {
    createItemType,
    getAllItemTypes,
    updateItemType,
    deleteItemType
} = require("../controllers/itemTypeController");

router.post("/", createItemType);

router.get("/", getAllItemTypes);

// update item type
router.put("/:id", updateItemType);

// delete item type
router.delete("/:id", deleteItemType);

module.exports = router;
