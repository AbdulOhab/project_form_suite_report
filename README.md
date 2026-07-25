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
├── Dockerfile          # Single image: builds the SPA + runs it from Express
├── docker-compose.yml  # app (SPA + API) + MongoDB
└── README.md
```

### Run with Docker (single image — SPA + API together)

The whole application runs from **one image**: the React client is built and
served by the Express server on the **same origin**, so there is only one port
to expose. `docker compose up` starts that app container plus MongoDB.

```bash
# from the project root
docker compose up -d --build          # or: podman-compose up -d --build
```

Then open **http://localhost:5053** — that single URL serves both the SPA and
the API. First run only, seed the users:

```bash
docker compose exec app node seeder.js seed
docker compose exec app node seeder.js check
```

**Notes**
- The app image bundles the code (no bind-mount); rebuild after code changes
  with `docker compose up -d --build`.
- MongoDB data and uploaded files persist in named volumes (`mongo_data`,
  `app_uploads`) across restarts.
- Config is passed as environment variables in `docker-compose.yml`
  (`MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`). Set a real `JWT_SECRET`
  before hosting — e.g. export it and reference `${JWT_SECRET}`.
- To host behind a domain, point it at the app's port 5053; the SPA calls the
  API relatively, so no separate frontend URL is needed.

### Setup & Run (local, without Docker)
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
- **User ID:** 101npm start
- **Password:** 1122

## Pending Updates
1. Make the site workable.
