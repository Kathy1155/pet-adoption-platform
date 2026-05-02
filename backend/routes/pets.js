const express = require("express");
const router = express.Router();
const db = require("../db");

function normalizePet(row) {
    return {
        ...row,
        id: row.id || row.shelter_id,
    };
}

router.get("/", (req, res) => {
    const { city, gender, species, age, shelterId } = req.query;

    let query = "SELECT * FROM pets WHERE 1=1";
    const queryParams = [];

    if (city) {
        query += " AND city = ?";
        queryParams.push(city);
    }

    if (gender) {
        query += " AND gender = ?";
        queryParams.push(gender);
    }

    if (species) {
        query += " AND species LIKE ?";
        queryParams.push(`%${species}%`);
    }

    if (age) {
        query += " AND age = ?";
        queryParams.push(age);
    }

    if (shelterId) {
        query += " AND shelter_id = ?";
        queryParams.push(shelterId);
    }

    db.execute(query, queryParams, (err, rows) => {
        if (err) {
            console.error("Pet list query failed:", err);
            return res.status(500).json({ error: "無法取得寵物列表" });
        }

        res.status(200).json(rows.map(normalizePet));
    });
});

router.get("/favorites/by-user/:username", (req, res) => {
    const { username } = req.params;

    const query = `
        SELECT p.*
        FROM favorites f
        JOIN pets p ON p.shelter_id = f.pet_id
        WHERE f.username = ?
        ORDER BY f.created_at DESC
    `;

    db.execute(query, [username], (err, rows) => {
        if (err) {
            console.error("Favorite list failed:", err);
            return res.status(500).json({ error: "無法取得收藏清單" });
        }

        res.json(rows.map(normalizePet));
    });
});

router.get("/:id", (req, res) => {
    const { id } = req.params;

    db.execute("SELECT * FROM pets WHERE shelter_id = ? LIMIT 1", [id], (err, rows) => {
        if (err) {
            console.error("Pet detail query failed:", err);
            return res.status(500).json({ error: "無法取得寵物資料" });
        }

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(404).json({ error: "找不到寵物資料" });
        }

        res.status(200).json(normalizePet(rows[0]));
    });
});

router.get("/:id/favorite", (req, res) => {
    const { id } = req.params;
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: "缺少使用者名稱" });
    }

    db.execute(
        "SELECT id FROM favorites WHERE username = ? AND pet_id = ? LIMIT 1",
        [username, id],
        (err, rows) => {
            if (err) {
                console.error("Favorite check failed:", err);
                return res.status(500).json({ error: "無法確認收藏狀態" });
            }

            res.json({ favorited: rows.length > 0 });
        }
    );
});

router.post("/:id/favorite", express.json(), (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "請先登入會員" });
    }

    db.execute(
        "INSERT IGNORE INTO favorites (username, pet_id) VALUES (?, ?)",
        [username, id],
        (err) => {
            if (err) {
                console.error("Favorite insert failed:", err);
                return res.status(500).json({ error: "收藏失敗" });
            }

            res.json({ message: "已加入收藏" });
        }
    );
});

router.delete("/:id/favorite", express.json(), (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "請先登入會員" });
    }

    db.execute(
        "DELETE FROM favorites WHERE username = ? AND pet_id = ?",
        [username, id],
        (err) => {
            if (err) {
                console.error("Favorite delete failed:", err);
                return res.status(500).json({ error: "取消收藏失敗" });
            }

            res.json({ message: "已取消收藏" });
        }
    );
});

module.exports = router;
