# Pet Adoption Platform

This workspace contains two local Node.js projects:

- `frontend/`: Express web server for the HTML pages and static assets.
- `backend/`: Express API server for login, registration, pet data, adoption requests, photo uploads, and MySQL access.

## Requirements

- Node.js and npm
- MySQL Server

## Install Dependencies

Run these from the workspace root:

```powershell
npm run install:backend
npm run install:frontend
```

## Database Setup

Create the database tables with:

```powershell
mysql -u root -p < backend/schema.sql
```

Create or update the local MySQL user in MySQL Workbench:

```sql
ALTER USER 'pet_app'@'localhost' IDENTIFIED BY '8888888';
GRANT ALL PRIVILEGES ON register.* TO 'pet_app'@'localhost';
FLUSH PRIVILEGES;
```

If the user does not exist yet, run this first:

```sql
CREATE USER 'pet_app'@'localhost' IDENTIFIED BY '8888888';
```

## Environment

Copy the backend environment template:

```powershell
copy backend\.env.example backend\.env
```

Then confirm the values in `backend/.env` match your MySQL setup.

## Run The App

Use two terminals.

Backend:

```powershell
npm run start:backend
```

Frontend:

```powershell
npm run start:frontend
```

Open the frontend at:

```text
http://localhost:3000
```

The backend API runs at:

```text
http://localhost:5000
```

## Notes

- The frontend and backend are intentionally started separately so each side can be debugged on its own.
- `backend/.env` contains local secrets and should not be committed.
- `backend/schema.sql` only creates the database tables. User permissions are managed separately in MySQL Workbench.
