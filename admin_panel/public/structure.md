src/
├── app/
│   ├── (auth)/login/page.tsx         # Clean split-screen or centered card login
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Persistent Sidebar + Topbar shell
│   │   ├── page.tsx                  # Analytics & Recharts overview
│   │   ├── doctors/
│   │   │   ├── page.tsx              # Doctors table/grid, filters, Create Modal
│   │   │   └── [id]/page.tsx         # Doctor profile + assigned patients list
│   │   └── patients/page.tsx         # Master Patients directory, filters, Edit/Delete
├── components/
│   ├── ui/                           # Reusable primitives (Button, Input, Modal, Badge, Table, Skeleton)
│   ├── layout/                       # Sidebar.tsx, Header.tsx, MobileNav.tsx
│   ├── dashboard/                    # StatCard.tsx, PatientsPerDoctorChart.tsx, GrowthChart.tsx
│   ├── doctors/                      # DoctorFormModal.tsx, DoctorFilters.tsx, AssignPatientModal.tsx
│   └── patients/                     # PatientFormModal.tsx, PatientFilters.tsx
├── lib/
│   ├── api.ts                        # Axios instance with auth interceptors
│   └── utils.ts                      # cn() helper (clsx + tailwind-merge) & date formatters
├── store/
│   └── useAuthStore.ts               # Zustand auth & UI sidebar state
└── types/
    └── index.ts                      # TypeScript interfaces for Doctor, Patient, & API responses


    /api/auth/login	Login
GET	/api/auth/me	Current user
GET	/api/doctors	List/search/filter
POST	/api/doctors	Create doctor
GET	/api/doctors/:id	Doctor details
GET	/api/doctors/:id/patients	Doctor's patients
POST	/api/patients	Add patient
GET	/api/patients	List/filter patients
PATCH	/api/patients/:id	Update patient
DELETE	/api/patients/:id	Delete patient
GET	/api/dashboard/stats	Dashboard analytics