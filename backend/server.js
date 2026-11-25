const express = require("express");

const app = express();

const PORT = 5000;

// middleware
app.use(express.json());

// serve frontend files
app.use(express.static("frontend"));

// import item type routes
const itemTypeRoutes = require("./routes/itemTypeRoutes");
const itemRoutes = require("./routes/itemRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");

// home route
app.get("/", (req, res) => {
    res.send("weassist item & purchase management api is running!");
});

// item  api
app.use("/api/item-types", itemTypeRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/purchases", purchaseRoutes);

// start server
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
