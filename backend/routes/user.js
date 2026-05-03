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

router.put("/profile", async (req, res) => {
    const { username, phone, address, password } = req.body;

    if (!username || !phone || !address) {
        return res.status(400).json({ error: "請完整填寫會員資料" });
    }

    try {
        const fields = ["phone = ?", "address = ?"];
        const values = [phone, address];

        if (password && password.trim()) {
            const hashedPassword = await bcrypt.hash(password.trim(), SALT_ROUNDS);
            fields.push("password = ?");
            values.push(hashedPassword);
        }

        values.push(username);

        db.execute(`UPDATE users SET ${fields.join(", ")} WHERE username = ?`, values, (err, result) => {
            if (err) {
                console.error("Update profile failed:", err);
                return res.status(500).json({ error: "會員資料更新失敗" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "找不到會員資料" });
            }

            res.json({
                message: "會員資料已更新",
                user: { username, phone, address },
            });
        });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ error: "會員資料更新失敗" });
    }
});

module.exports = router;
