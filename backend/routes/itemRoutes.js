
const express = require("express");
const router = express.Router();

const {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
} = require("../controllers/itemController");

// create item
router.post("/", createItem);

// get all items
router.get("/", getAllItems);

// retrive item id
router.get("/:id", getItemById);

 //update item
router.put("/:id", updateItem);

//delete item 
router.delete("/:id", deleteItem);

module.exports = router;
