# 寵物領養平台

這是一個以「想領養寵物的使用者」為主要對象的寵物領養平台。系統提供寵物資料瀏覽、條件篩選、詳細資料查看、收藏、會員中心與領養申請功能。

專案分成前端與後端兩個 Node.js 服務：

- `frontend/`：前台網頁、靜態資源與頁面路由。
- `backend/`：API 服務，負責會員註冊登入、寵物資料、收藏、領養申請與 MySQL 資料庫存取。

## 主要功能

- 寵物清單瀏覽與條件篩選
- 寵物詳細資料頁
- 加入與取消收藏
- 會員註冊、登入、登出
- 會員中心
- 領養申請表單
- 查看自己的申請紀錄
- MySQL 資料庫儲存寵物、會員、收藏與申請資料

## 環境需求

- Node.js
- npm
- MySQL Server

## 安裝套件

請在專案根目錄執行：

```powershell
npm run install:backend
npm run install:frontend
```

## 資料庫設定

先建立資料表：

```powershell
mysql -u root -p < backend/schema.sql
```

接著在 MySQL Workbench 建立或更新本機使用者：

```sql
CREATE USER 'pet_app'@'localhost' IDENTIFIED BY '8888888';
GRANT ALL PRIVILEGES ON register.* TO 'pet_app'@'localhost';
FLUSH PRIVILEGES;
```

如果 `pet_app` 使用者已經存在，請改用：

```sql
ALTER USER 'pet_app'@'localhost' IDENTIFIED BY '8888888';
GRANT ALL PRIVILEGES ON register.* TO 'pet_app'@'localhost';
FLUSH PRIVILEGES;
```

## 環境變數

複製後端環境變數範本：

```powershell
copy backend\.env.example backend\.env
```

然後確認 `backend/.env` 內的資料庫帳號、密碼、資料庫名稱與本機 MySQL 設定一致。

`backend/.env` 只適合放在自己的電腦，不應該上傳到 GitHub。

## 啟動方式

請開兩個終端機分別啟動前端與後端。

後端：

```powershell
npm run start:backend
```

前端：

```powershell
npm run start:frontend
```

啟動後開啟：

```text
http://localhost:3000
```

後端 API 預設執行在：

```text
http://localhost:5000
```

## 專案結構

```text
pet-adoption-platform/
├── backend/
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   ├── photos/
│   ├── schema.sql
│   └── .env.example
├── frontend/
│   ├── index.js
│   └── src/
│       ├── templates/
│       └── asserts/styles/
├── package.json
└── README.md
```

## 注意事項

- 前端與後端刻意分開啟動，方便單獨檢查前端畫面或後端 API 問題。
- `node_modules/` 不需要上傳 GitHub，重新安裝套件即可產生。
- `backend/schema.sql` 負責建立資料表，MySQL 使用者權限需要另外在 MySQL Workbench 或命令列中設定。
- 若按下「查看詳細資料」或「我要領養」後資料載入失敗，通常要先確認後端是否啟動、MySQL 是否啟動，以及 `backend/.env` 是否設定正確。
