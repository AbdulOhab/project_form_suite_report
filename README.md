# Project Form Suite (Instance Report)

A full-stack form and reporting system that enables data collection, verification, and report generation across Branch, Zonal, and Admin levels.

## Overview

This project is split into two parts — a React-based client side and a Node.js/Express-based server side. MongoDB is used as the database, and authentication is handled via JWT.

### Key Features
- **User Role Management** — Admin, Zonal, Branch, and Check user models.
- **Dashboard** — Role-specific dashboards and pages.
- **Notice Board** — Create, edit, and publish notices.
- **Question & Answer (Q&A)** — Form-based question and answer storage.
- **Data Check & Verification** — Verify and approve collected data.
- **Reports / Sums Data** — Aggregated calculations and report generation with Excel (xlsx) export support.
- **User Create & Update** — Manage users from the admin panel.

### Tech Stack
- **Frontend:** React 18, React Router 6, Redux, MUI, Axios, SweetAlert2, xlsx, Moment
- **Backend:** Node.js, Express 4, Mongoose 8, JWT, bcrypt, Multer, express-form-data
- **Database:** MongoDB 7 (runs via Docker Compose)
- **Dev Tools:** Nodemon, React Scripts

### Project Structure
```
project-form-suite/
├── client-side/        # React application
│   └── src/
│       ├── auth/           # Login / auth logic
│       ├── components/     # Reusable components
│       ├── contexts/       # React context
│       ├── dashboard/      # Dashboard pages and layouts
│       ├── frontend/       # Public pages (Home, Login, About...)
│       ├── layouts/        # Common layouts
│       └── routes/         # Route config
├── server-side/        # Express API server (port 5053)
│   ├── config/             # DB connection config
│   ├── controller/         # Route controllers
│   ├── middleware/         # Auth / validation middleware
│   ├── model/              # Mongoose models (admin, branch, zonal, check, answer ...)
│   └── router/             # API routes
├── docker-compose.yml  # MongoDB container
└── README.md
```

### Setup & Run
1. **Start MongoDB** (Docker):
   ```bash
   docker-compose up -d
   ```
2. **Start the Backend:**
   ```bash
   cd server-side
   npm install
   npm run serve     # runs index.js with nodemon (http://localhost:5053)
   ```
3. **Start the Frontend:**
   ```bash
   cd client-side
   npm install
   npm start         # http://localhost:3000
   ```

## Login Credentials
- **User ID:** 101
- **Password:** 1122

## Pending Updates
1. Make the site workable.
