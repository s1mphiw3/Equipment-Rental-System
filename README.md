# Equipment Rental System

A full-stack **equipment rental management** platform.

- **Frontend (React + Vite):** UI for customers and admin/staff (equipment browsing, rentals, damage reports, penalties, payments, maintenance, etc.).
- **Backend (Express + Node.js):** REST API implementing authentication, rental workflow, damage/penalty handling, analytics, and payment flows.
- **Database (MySQL/MariaDB):** Stores users, equipment, rentals, damage reports, penalties, maintenance records, agreements, payments, and pickup/returns data.

---

## 1) How the system works (high level)

### Request flow
1. The **frontend** calls the backend using Axios.
   - Base URL comes from `REACT_APP_API_URL` (default: `http://localhost:5000/api`).
   - Auth is sent as `Authorization: Bearer <token>` from `localStorage`.
2. The **backend** validates the request, checks auth/roles, performs DB operations, and returns JSON.
3. For media:
   - Uploaded images (e.g., damage report photos) and PDFs (rental agreements) are saved under backend `uploads/`.
   - The backend exposes them publicly at: `http://<backend-host>:<port>/uploads/...`.

### Main domains implemented by the backend
- **Auth & users**: registration, login, email verification, 2FA (if enabled), role-based access.
- **Equipment**: categories + equipment CRUD, availability/quantity handling, maintenance flag.
- **Rentals workflow**: create rental, manage status (confirmed → picked up → returned), generate agreements.
- **Pickup/returns**: staff-side pickup and return processing + condition notes.
- **Damage reports**: customer reports damage during/after rentals; admin/staff reviews, repairs, estimates/costs.
- **Penalties**: late return and damage-related penalties; penalty payment handling.
- **Payments**: Stripe-based payment intents (and confirmation). 
- **Analytics**: equipment utilization, booking patterns, revenue analytics, top categories, maintenance analytics.

---

## 2) Repository structure

- `equipment-rental-frontend/` – React (Vite) frontend
- `equipment-rental-management-system/` – Express backend
- `equipment_rental_management_system.sql` – MySQL/MariaDB dump for the database schema + seed data

---

## 3) Setup (local development)

### Prerequisites
- Node.js (for both frontend + backend)
- MySQL or MariaDB (server running)
- (Optional) Stripe keys if you want real payment processing

---

## 4) Database setup

1. Create the database:
   - The backend default DB name is `equipment_rental_management_system`.
2. Import the SQL dump:
   - `equipment_rental_management_system.sql`

Example (using `mysql` client):

```bash
mysql -u root -p equipment_rental_management_system < equipment_rental_management_system.sql
```

This dump includes tables such as:
- `users`, `categories`, `equipment`
- `rentals`, `rental_agreements`
- `pickup_returns`
- `damage_reports`
- `maintenance`
- `payments`, `penalties`, `penalty_payments` (plus related indices/constraints)

---

## 5) Backend setup (Express)

1. Go to backend folder:

```bash
cd equipment-rental-management-system
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables

Create a `.env` file inside `equipment-rental-management-system/`.

At minimum, configure these DB values (names used by `config/database.js`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=equipment_rental_management_system

# Used for CORS. Ensure it matches the frontend dev server.
FRONTEND_URL=http://localhost:5173

# Optional
PORT=5000
```

4. Run the backend:

```bash
npm start
```

Then verify the service is running:
- `http://localhost:5000/api/health`

Uploaded files will be served here:
- `http://localhost:5000/uploads/<file>`

---

## 6) Frontend setup (React + Vite)

1. Go to frontend folder:

```bash
cd equipment-rental-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables

Create a `.env` file inside `equipment-rental-frontend/`.

`src/services/api.js` uses `import.meta.env.REACT_APP_API_URL`.

```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Run the frontend:

```bash
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173`).

---

## 7) Frontend ↔ Backend contract (practical notes)

### Base URLs
- Backend API: `REACT_APP_API_URL` (default `http://localhost:5000/api`)
- Uploaded assets: `http://<backend-host>:<port>/uploads/...`

### Authentication
- The frontend sends JWT in the header:
  - `Authorization: Bearer <token>`
- On 401, the frontend clears token and redirects to `/login`.

### Example backend route groups
(Implemented by routes mounted in backend `app.js`)
- `POST /api/auth/*`
- `GET/POST/PUT/DELETE /api/equipment/*`
- `GET/POST/PUT /api/rentals/*`
- `POST /api/payments/*`
- `GET/POST /api/damage-reports/*`
- `GET/POST /api/penalties/*`
- `GET/POST /api/maintenance/*`
- `GET/POST /api/analytics/*`

---

## 8) Default roles / admin vs customer behavior

Backend endpoints apply role-based access (e.g., admin/staff for analytics, equipment maintenance, approvals).

User roles stored in DB:
- `admin`
- `staff`
- `customer`

---

## 9) Common troubleshooting

- **CORS errors**: ensure `FRONTEND_URL` in backend `.env` matches your frontend dev server URL (e.g. `http://localhost:5173`).
- **API calls failing**: confirm `REACT_APP_API_URL` in frontend `.env` points to the backend `/api`.
- **Uploads not displaying**: check backend is running and that the file is being served from `/uploads`.
- **Database connection fails**: verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

---

## 10) Files of interest

- Backend entry: `equipment-rental-management-system/app.js`
- Backend DB config: `equipment-rental-management-system/config/database.js`
- Frontend API client: `equipment-rental-frontend/src/services/api.js`
- Database dump/seed: `equipment_rental_management_system.sql`

