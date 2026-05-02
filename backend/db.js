const path = require("path");
const mysql = require("mysql2");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const requiredEnv = ["DB_HOST", "DB_USER", "DB_NAME"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing database environment settings: ${missingEnv.join(", ")}`);
  console.error("Check backend/.env or copy backend/.env.example and fill in the values.");
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed.");
    console.error(`Host: ${process.env.DB_HOST || "(missing)"}`);
    console.error(`User: ${process.env.DB_USER || "(missing)"}`);
    console.error(`Database: ${process.env.DB_NAME || "(missing)"}`);
    console.error(`MySQL error: ${err.message}`);
    return;
  }

  console.log("Database connected.");
});

module.exports = db;
