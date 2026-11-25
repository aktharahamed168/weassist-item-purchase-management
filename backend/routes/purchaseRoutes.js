const express = require("express");
const router = express.Router();

const {
    createPurchase,
    getAllPurchases,
    getPurchaseById,
    updatePurchase
} = require("../controllers/purchaseController");

// create purchase
router.post("/", createPurchase);

// get all purchases
router.get("/", getAllPurchases);

// get purchase details by id
router.get("/:id", getPurchaseById);

// update purchase
router.put("/:id", updatePurchase);

module.exports = router;