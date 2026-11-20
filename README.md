# Doctor Tracker — Full-Stack Clinical & Patient Management System

A full-stack **Doctor Tracker** application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Zustand**, **React Hook Form + Zod**, and **Axios** on the frontend, paired with a **Node.js**, **Express (ES Modules)**, and **MongoDB (Mongoose)** MVC backend.

---

## Key Features

- **JWT Authentication & Session Guarding**
  - Admin login (`/api/auth/login`), profile inspection (`/api/auth/me`), and admin seeding (`/api/auth/seed-admin`).
  - Zustand auth store (`useAuthStore`) with `localStorage` persistence, `dt_auth_token` cookie synchronization, Next.js middleware protection (`src/middleware.ts`), and client route guarding (`ProtectedRoute`).
  - Axios request/response interceptors attaching Bearer tokens and handling `401` session expiration cleanly.
- **Doctors Directory & Caseload Assignment**
  - Full CRUD operations for doctors (`/api/doctors`) with search, specialization/status filtering, and pagination.
  - Patient assignment and removal flows under specific doctors with validated payloads and toast notifications.
- **Central Patient Registry**
  - Full CRUD operations for patients (`/api/patients`) supporting search, condition filtering (`Stable`, `Monitoring`, `Critical`, `Recovering`), doctor filtering, date-range filtering, and pagination.
- **Admin Analytics Dashboard**
  - Real-time KPI summary cards (Total Doctors, Total Patients, Average Patients per Doctor), registration/growth trends, doctor workload visualization, and recent patient admissions (`/api/analytics`).
- **Consistent UI & Naming Convention**
  - Enforces a lowercase snake_case class naming convention (`functionname_classname_element`) across custom CSS files and React UI components.

---

## Project Architecture

```text
├── backend/                     # Node.js + Express + MongoDB (MVC)
│   ├── config/                  # Database connection & environment config
│   ├── controllers/             # Auth, Doctor, Patient, and Analytics handlers
│   ├── middleware/              # JWT auth middleware (protectAdmin) & error handling
│   ├── models/                  # Mongoose schemas & indexes (Admin, Doctor, Patient)
│   ├── routes/                  # Express route definitions (/api/*)
│   └── server.js                # Express app entry point & CORS configuration
│
└── frontend/                    # Next.js App Router + TypeScript
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/login/    # Admin authentication page
    │   │   └── (dashboard)/     # Protected dashboard, doctors, and patients routes
    │   ├── components/          # Auth guards, layout shell, modals, filters, charts
    │   ├── lib/                 # Axios client & error extraction helpers
    │   ├── services/            # Typed API services (auth, doctor, patient, analytics)
    │   ├── store/               # Zustand stores (useAuthStore)
    │   └── middleware.ts        # Next.js route guard checking dt_auth_token
    └── package.json
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/doctor_tracker
JWT_SECRET=replace_with_a_strong_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Local Setup & Running the Application

### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend Web App

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser and sign in via `/login`.

---

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/seed-admin` | Seed initial administrator account | No (dev/setup) |
| `POST` | `/api/auth/login` | Authenticate admin and return JWT | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated admin | Yes (JWT) |
| `GET` | `/api/doctors` | List doctors with search, filters & pagination | Yes (JWT) |
| `POST` | `/api/doctors` | Create a new doctor record | Yes (JWT) |
| `PATCH` / `PUT` | `/api/doctors/:id` | Update an existing doctor record | Yes (JWT) |
| `DELETE` | `/api/doctors/:id` | Delete a doctor record | Yes (JWT) |
| `POST` | `/api/doctors/:id/patients` (or `/api/doctors/assign_patient/:id`) | Assign a patient to a specific doctor | Yes (JWT) |
| `GET` | `/api/patients` | List patients with search, condition, doctor, date range & pagination | Yes (JWT) |
| `POST` | `/api/patients` | Create a new patient record | Yes (JWT) |
| `PATCH` / `PUT` | `/api/patients/:id` | Update a patient record | Yes (JWT) |
| `DELETE` | `/api/patients/:id` | Delete a patient record | Yes (JWT) |
| `GET` | `/api/analytics` | Retrieve dashboard summary metrics & chart series | Yes (JWT) |

---

## Engineering & Coding Standards

- **Lowercase Snake Case UI Identifiers:** Custom CSS classes and component element identifiers follow `functionname_classname_element` (for example, `header_logoutbtn_button`, `patientspage_table_table`, `dashboardpage_wrapper_div`).
- **Validation & Type Safety:** Form inputs are validated client-side with `zod` and `react-hook-form`, and API responses/requests are typed in `src/services/`.
- **Clean Session Teardown:** Logging out clears Zustand state, removes persisted auth storage, expires `dt_auth_token`, and redirects to `/login`.