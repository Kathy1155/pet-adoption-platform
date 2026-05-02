const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");

const SALT_ROUNDS = 10;

router.post("/register", async (req, res) => {
    const { username, password, phone, address } = req.body;

    if (!username || !password || !phone || !address) {
        return res.status(400).json({ error: "請完整填寫註冊資料" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const query = "INSERT INTO users (username, password, phone, address) VALUES (?, ?, ?, ?)";

        db.execute(query, [username, hashedPassword, phone, address], (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ error: "使用者名稱已被註冊" });
                }

                console.error("Register failed:", err);
                return res.status(500).json({ error: "註冊失敗，請稍後再試" });
            }

            res.status(201).json({ message: "註冊成功" });
        });
    } catch (err) {
        console.error("Password hash failed:", err);
        res.status(500).json({ error: "註冊失敗，請稍後再試" });
    }
});

module.exports = router;
