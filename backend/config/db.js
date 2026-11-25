
const mysql = require("mysql2");
require("dotenv").config({ path: "backend/.env" });

const db = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name
});

db.connect((err) => {
    if (err) {
        console.error("database connection failed:", err.message);
        return;
    }

    console.log("mysql database connected successfully!");
});

module.exports = db;
