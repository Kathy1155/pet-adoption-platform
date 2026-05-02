const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") }); // Load backend/.env no matter where the server is started from.
require("dotenv").config(); // 用於讀取環境變數

const app = express(); // 在這裡初始化 express 應用

// 設定靜態文件夾，例如 index.html
app.use(express.static(path.join(__dirname, 'src', 'templates')));

// 其他中間件設定和路由
app.use(express.json()); // 設置 JSON 請求的解析
app.use(cors()); // 啟用跨域請求
app.use(bodyParser.json()); // 處理 JSON 請求
app.use(bodyParser.urlencoded({ extended: true })); 

// 設置靜態資料夾來提供圖片
app.use('/photos', express.static('photos')); // 從 'photos' 資料夾提供圖片

// 設置 multer 來處理圖片上傳
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 設定儲存圖片的資料夾
        cb(null, 'photos');
    },
    filename: (req, file, cb) => {
        // 設定儲存圖片的檔案名稱，這裡將檔案名稱設為時間戳以避免重複
        cb(null, Date.now() + path.extname(file.originalname)); // 使用時間戳
    }
});

// 創建 multer 實例
const upload = multer({ storage: storage });

// 上傳圖片的路由
app.post('/upload', upload.single('image'), (req, res) => {
    // 檢查是否有上傳文件
    if (!req.file) {
        return res.status(400).json({ error: "沒有選擇圖片" });
    }

    // 圖片上傳後返回圖片的 URL
    res.status(200).json({ 
        message: "圖片上傳成功",
        url: `/photos/${req.file.filename}` // 返回圖片的 URL
    });
});

// 引入其他路由
const userRoutes = require("./routes/user");
const petRoutes = require('./routes/pets');
const loginRouter = require('./routes/login'); 
const adoptRoutes = require("./routes/adopt");  // 引入領養路由


app.use("/api/user", userRoutes);// 註冊路由
app.use('/api/pets', petRoutes);
app.use("/adopt", adoptRoutes);// 使用領養路由
app.use('/api', loginRouter);

// 啟動伺服器
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Backend port ${PORT} is already in use. Stop the other backend server or change PORT in backend/.env.`);
        return;
    }

    console.error("Backend server failed to start.");
    console.error(err.message);
});
