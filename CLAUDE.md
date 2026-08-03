# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hierarchical form-based data collection and reporting system (Admin → Zonal → Branch → Thana). Full-stack: React 18 frontend + Express/MongoDB backend.

## Commands

### Development
```bash
# Start MongoDB
docker-compose up -d

# Backend (port 5053)
cd server-side && npm run serve

# Frontend (port 3000)
cd client-side && npm start
```

### Database Seeding (from server-side/)
```bash
node seeder.js seed     # Seed ALL users (3 admin + 5 zonal + 15 branch + 45 thana)
node seeder.js admin    # Seed admins only
node seeder.js zonal    # Seed zonals only
node seeder.js branch   # Seed branches only
node seeder.js check    # Verify seeded data integrity
node seeder.js wipe     # Delete ALL data from database
```

### No test suite configured
No tests exist. Run `npm audit` in both `server-side/` and `client-side/` for dependency checks.

## Architecture

### Auth Flow
1. `POST /submit` with `{userId, password}` → `authController.form_submit`
2. Searches `thanaModel` (collection "users") for matching `userId`
3. bcrypt password check → JWT signed with `process.env.JWT_SECRET`
4. Token payload: `{userId, userRole, thanaCode?, branchCode?, zonalCode?}` — **no password**
5. Client stores token in `localStorage.gsmToken`
6. `Authorization: Bearer <token>` header on protected requests
7. `authMiddleware.js` verifies token, attaches `req.userData`

### Critical Pattern: Single Model for All Users
ALL users (admin, zonal, branch, thana) are stored in `thanaModel` ("users" collection). Despite separate model files existing (`adminModel.js`, `branchModel.js`, `zonalModel.js`), only `thanaModel` is used for authentication and user management. Do NOT use other models for auth.

### Data Hierarchy
```
Admin  (userId: 110011-110013, no codes)
 └─ Zonal  (userId/zonalCode: 201-205)
     └─ Branch (userId/branchCode: 301-315, 3 per zonal)
         └─ Thana  (userId/thanaCode: 401-445, 3 per branch)
```

### Collections
- **users** — All user accounts (thanaModel)
- **form_models_2024** — Notice/form definitions (formModel)
- **answer_models_2024** — Submitted answers (answerModel)

### Route Structure
`server-side/router/allRouter.js` aggregates 8 route files from `router/routes/`. `authMiddleware` + role-based `requireRole(...)` (from `middleware/roleMiddleware.js`) are applied across all of them — only `homeRouter.js` (`/`, `/about`) and the `/submit` login endpoint are intentionally public.

### Frontend Routing
Uses `BrowserRouter` (plain paths like `/dashboard`, no `#`). 52 routes defined in `client-side/src/App.jsx`. The whole dashboard section is wrapped in `AuthRoutes.jsx` (login required); individual routes are further gated by `RoleRoute` (role-specific access, e.g. `roles={["thana"]}`).

## Environment

### server-side/.env
```
PORT=5053
MONGODB_URI=mongodb://localhost:27017/instancereport
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
CORS_ORIGIN=http://localhost:3000
```

### client-side/.env
```
REACT_APP_API_BASE_URL=http://localhost:5053
```

## Known Issues (see PRODUCTION_PLAN.md for full details)
- No helmet, rate-limiting, or input sanitization
- Unused model files still present: `adminModel.js`, `branchModel.js`, `zonalModel.js`, `checkModel.js` (nothing imports them — only `thanaModel` is used, see above)
- Typos throughout: "Dadeline" → "Deadline" (265 occurrences across 40 files)
- `request.http` is gitignored now, but a real JWT was committed in it before the ignore was added (commit `1981fcc`) — rotating `JWT_SECRET` and scrubbing that commit from history are still outstanding
