const express = require("express");
const path = require("path");
const { exec } = require("child_process");

const app = express();
// 設置靜態文件夾
app.use('/src/asserts', express.static(path.join(__dirname, 'src', 'asserts')));
app.use('/src/templates', express.static(path.join(__dirname, 'src', 'templates')));

// 首頁路由
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "templates", "home.html"));
});

// 登入頁面
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "templates", "login.html"));
});

// 註冊頁面
app.get("/register-page", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "templates", "register.html"));
});

//領養頁面
app.get("/adopt", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "templates", "adopt.html"));
});

app.get("/pet-detail", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "templates", "pet-detail.html"));
});


// 用戶資料頁面
app.get("/profile", (req, res) => {
    const user = {
        username: "用戶名稱",
    };
    const adoptionHistory = [
        { name: "貴賓狗", adoption_date: "2023-08-15" },
        { name: "米克斯", adoption_date: "2024-01-12" },
    ];
    res.sendFile(path.join(__dirname, "src", "templates", "profile.html"));
});

// 搜尋頁面
app.get("/search", (req, res) => {
    const params = {
        city: req.query.city,
        gender: req.query.gender,
        species: req.query.species,
        age: req.query.age,
        shelterId: req.query["shelter-id"],
    };

    // 獲取篩選後的寵物資料
    const pets = fetchFilteredPets(params);

    // 以 JSON 格式傳回寵物資料
    res.json(pets);
});

// 篩選寵物資料的輔助函數
function fetchFilteredPets(params) {
    const samplePets = [
        { name: "貴賓狗", species: "狗", gender: "公", city: "台北市", age: "成年" },
        { name: "米克斯", species: "狗", gender: "母", city: "台中市", age: "幼齡" },
        { name: "波斯貓", species: "貓", gender: "公", city: "高雄市", age: "成年" },
    ];

    // 根據查詢參數進行篩選
    let filteredPets = samplePets;
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            filteredPets = filteredPets.filter((pet) => pet[key] === value);
        }
    }
    return filteredPets;
}

// 登出頁面
app.get("/logout", (req, res) => {
    res.redirect("/");
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Server is running on ${url}`);

    if (process.env.NO_OPEN !== "1") {
        const openCommand = process.platform === "win32"
            ? `start "" "${url}"`
            : process.platform === "darwin"
                ? `open "${url}"`
                : `xdg-open "${url}"`;

        exec(openCommand);
    }
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Frontend port ${PORT} is already in use. Stop the other frontend server or set a different PORT.`);
        return;
    }

    console.error("Frontend server failed to start.");
    console.error(err.message);
});
