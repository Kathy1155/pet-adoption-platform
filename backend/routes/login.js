const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");

const SALT_ROUNDS = 10;

function isBcryptHash(value) {
    return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
}

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "請輸入帳號與密碼" });
    }

    try {
        const [users] = await db.promise().execute("SELECT * FROM users WHERE username = ?", [username]);

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(401).json({ error: "帳號或密碼錯誤" });
        }

        const user = users[0];
        const storedPassword = user.password || "";
        const passwordMatches = isBcryptHash(storedPassword)
            ? await bcrypt.compare(password, storedPassword)
            : password === storedPassword;

        if (!passwordMatches) {
            return res.status(401).json({ error: "帳號或密碼錯誤" });
        }

        if (!isBcryptHash(storedPassword)) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            await db.promise().execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
        }

        const { username: savedUsername, phone, address } = user;
        return res.status(200).json({
            message: "登入成功",
            user: { username: savedUsername, phone, address },
        });
    } catch (err) {
        console.error("Login failed:", err);
        return res.status(500).json({ error: "登入失敗，請稍後再試" });
    }
});

module.exports = router;
