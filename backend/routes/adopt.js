const express = require("express");
const router = express.Router();
const db = require("../db");

function updatePetStatusFromApplications(petId, explicitStatus, callback) {
    if (explicitStatus === "adopted") {
        db.query("UPDATE pets SET status = 'adopted' WHERE shelter_id = ?", [petId], callback);
        return;
    }

    db.query(
        "SELECT COUNT(*) AS active_count FROM adoptions WHERE pet_id = ? AND status IN ('pending', 'contacted')",
        [petId],
        (countErr, rows) => {
            if (countErr) {
                callback(countErr);
                return;
            }

            const hasActiveApplications = rows[0].active_count > 0;
            const nextStatus = hasActiveApplications ? "application_pending" : "available";
            db.query("UPDATE pets SET status = ? WHERE shelter_id = ?", [nextStatus, petId], callback);
        }
    );
}

router.post("/submit-adoption", express.json(), (req, res) => {
    const {
        name,
        email,
        phone,
        pet_id,
        experience,
        message,
        applicant_username,
        housing_type,
        pet_allowed,
        has_other_pets,
        daily_company_time,
        family_agreement,
        follow_up_agreement,
        responsibility_agreement,
    } = req.body;

    if (!name || !email || !phone || !pet_id || !experience || !housing_type || !pet_allowed || !has_other_pets || !daily_company_time) {
        return res.status(400).json({ error: "請完整填寫領養申請資料" });
    }

    if (!family_agreement || !follow_up_agreement || !responsibility_agreement) {
        return res.status(400).json({ error: "請先確認領養前注意事項" });
    }

    const query = `
        INSERT INTO adoptions
            (
                name,
                email,
                phone,
                pet_id,
                experience,
                message,
                applicant_username,
                housing_type,
                pet_allowed,
                has_other_pets,
                daily_company_time,
                family_agreement,
                follow_up_agreement,
                responsibility_agreement,
                status
            )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const values = [
        name,
        email,
        phone,
        pet_id,
        experience,
        message || "",
        applicant_username || "",
        housing_type,
        pet_allowed,
        has_other_pets,
        daily_company_time,
        Boolean(family_agreement),
        Boolean(follow_up_agreement),
        Boolean(responsibility_agreement),
    ];

    db.query(query, values, (err) => {
        if (err) {
            console.error("Submit adoption failed:", err);
            return res.status(500).json({ error: "送出領養申請失敗" });
        }

        updatePetStatusFromApplications(pet_id, null, (updateErr) => {
            if (updateErr) {
                console.error("Pet status update failed:", updateErr);
            }

            res.json({ message: "領養申請已送出" });
        });
    });
});

router.get("/my-applications", (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: "缺少使用者名稱" });
    }

    const query = `
        SELECT
            a.id,
            a.pet_id,
            a.name,
            a.email,
            a.phone,
            a.experience,
            a.message,
            a.housing_type,
            a.pet_allowed,
            a.has_other_pets,
            a.daily_company_time,
            a.status,
            a.created_at,
            p.species,
            p.gender,
            p.city,
            p.age,
            p.photo_url,
            p.status AS pet_status
        FROM adoptions a
        LEFT JOIN pets p ON p.shelter_id = a.pet_id
        WHERE a.applicant_username = ?
        ORDER BY a.created_at DESC
    `;

    db.query(query, [username], (err, rows) => {
        if (err) {
            console.error("My applications query failed:", err);
            return res.status(500).json({ error: "無法取得申請紀錄" });
        }

        res.json(rows);
    });
});

router.get("/applications", (req, res) => {
    const query = `
        SELECT
            a.id,
            a.pet_id,
            a.name,
            a.email,
            a.phone,
            a.experience,
            a.message,
            a.applicant_username,
            a.housing_type,
            a.pet_allowed,
            a.has_other_pets,
            a.daily_company_time,
            a.status,
            a.created_at,
            p.species,
            p.gender,
            p.city,
            p.age,
            p.photo_url,
            p.status AS pet_status
        FROM adoptions a
        LEFT JOIN pets p ON p.shelter_id = a.pet_id
        ORDER BY a.created_at DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            console.error("Applications query failed:", err);
            return res.status(500).json({ error: "無法取得申請清單" });
        }

        res.json(rows);
    });
});

router.patch("/applications/:id/status", express.json(), (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["pending", "contacted", "approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "不支援的申請狀態" });
    }

    db.query("SELECT pet_id FROM adoptions WHERE id = ?", [id], (findErr, rows) => {
        if (findErr) {
            console.error("Find application failed:", findErr);
            return res.status(500).json({ error: "無法更新申請狀態" });
        }

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(404).json({ error: "找不到申請資料" });
        }

        const petId = rows[0].pet_id;

        db.query("UPDATE adoptions SET status = ? WHERE id = ?", [status, id], (updateErr) => {
            if (updateErr) {
                console.error("Update application status failed:", updateErr);
                return res.status(500).json({ error: "無法更新申請狀態" });
            }

            const explicitPetStatus = status === "approved" ? "adopted" : null;

            updatePetStatusFromApplications(petId, explicitPetStatus, (petErr) => {
                if (petErr) {
                    console.error("Update pet status failed:", petErr);
                    return res.status(500).json({ error: "申請已更新，但寵物狀態更新失敗" });
                }

                res.json({ message: "申請狀態已更新" });
            });
        });
    });
});

module.exports = router;
