<<<<<<< HEAD
# hospital-app
Manage appointments, doctors, patients, and billing
=======
# 🏥 Hospital Management System — Frontend

Built with **Next.js 14 + TypeScript + Tailwind CSS**  
Backend: `https://hospital-managemnt-system.vercel.app/api/v1`

---

## ⚡ Quick Setup (Step by Step)

### Step 1 — Install Node.js
If you don't have Node.js installed:
- Go to https://nodejs.org
- Download **LTS version** (e.g. 20.x)
- Install it and restart your terminal

Verify: `node -v` should show v18+ or v20+

---

### Step 2 — Open this project folder
```bash
cd hospital-app
```

---

### Step 3 — Install dependencies
```bash
npm install
```
Wait for it to finish (may take 1–2 minutes first time).

---

### Step 4 — Set up environment variable
The `.env.local` file is already created for you with:
```
NEXT_PUBLIC_API_URL=https://hospital-managemnt-system.vercel.app/api/v1
```
No changes needed unless the backend URL changes.

---

### Step 5 — Run the app
```bash
npm run dev
```
Open your browser at: **http://localhost:3000**

You'll be redirected to the login page automatically.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── login/              ← Login page
│   ├── dashboard/
│   │   ├── layout.tsx      ← Main app shell (sidebar + navigation)
│   │   └── page.tsx        ← Dashboard home
│   ├── permissions/
│   │   ├── hospitals/      ← Hospital management (Super Admin only)
│   │   └── users/          ← User management (role-based)
│   └── patients/           ← Patient management (placeholder)
├── components/             ← Reusable UI components
├── hooks/
│   └── useAuth.ts          ← Auth hooks (useAuth, useRequireAuth, useInitAuth)
├── lib/
│   ├── api.ts              ← Axios client with JWT + auto-refresh
│   └── utils.ts            ← Helper functions (cn, getErrorMessage)
├── store/
│   └── authStore.ts        ← Zustand global auth state
└── types/
    └── index.ts            ← All TypeScript types + role permissions matrix
```

---

## 🔐 How Authentication Works

1. User logs in → backend returns `accessToken` in JSON body + sets `refreshToken` as httpOnly cookie
2. `accessToken` is stored **in memory only** (Zustand store) — never localStorage
3. Every API request automatically includes `Authorization: Bearer <token>`
4. If token expires (401 response) → Axios interceptor automatically calls `/auth/refresh`
5. On page refresh → `useInitAuth` hook calls `/auth/refresh` to restore the session

---

## 👥 Role Permissions

| Role | Can Create | Can View |
|------|-----------|---------|
| **Super Admin** | All roles | All hospitals + all users |
| **Hospital Admin** | Admin, Receptionist, Doctor, Accountant | Own hospital users |
| **Receptionist** | Receptionist, Doctor, Accountant | Own branch users |
| **Doctor** | ❌ None | ❌ No permissions access |
| **Accountant** | ❌ None | ❌ No permissions access |

### Permissions Interface Access
- `/permissions/hospitals` → **Super Admin only** (add/view/edit hospitals)
- `/permissions/users` → **Super Admin, Hospital Admin, Receptionist** (add/view/edit users based on role)

---

## 🧪 Testing with Postman (for your teammate's API)

Since your Postman link expired, here's how to test manually:

### 1. Open Postman → New Request
### 2. Test Login:
- **Method**: POST
- **URL**: `https://hospital-managemnt-system.vercel.app/api/v1/auth/login`
- **Body** (JSON):
```json
{
  "email": "your-test-email@hospital.com",
  "password": "yourpassword"
}
```
- Copy the `accessToken` from the response

### 3. Test any protected endpoint:
- Go to **Authorization tab** → Select **Bearer Token**
- Paste the `accessToken`
- Hit Send

---

## 🏗️ Building Other Pages

The project is structured so you can easily add more pages:

```tsx
// Example: Adding Doctors page
// 1. Create: src/app/doctors/page.tsx
// 2. Create: src/app/doctors/layout.tsx (copy from patients/layout.tsx)
// 3. Use useRequireAuth(['Hospital Admin', 'Super Admin']) to guard it
// 4. Call api.get('/doctors') to fetch data
```

---

## 📦 Key Libraries Used

| Library | Purpose |
|---------|---------|
| `next` 14 | React framework (routing, SSR) |
| `axios` | HTTP client with interceptors |
| `zustand` | Global state (auth token, user) |
| `tailwindcss` | Utility-first CSS styling |
| `lucide-react` | Icons |
| `react-hot-toast` | Toast notifications |
| `dayjs` | Date formatting |

---

## 🚀 Build for Production

```bash
npm run build
npm start
```

---

## ⚠️ Important Notes

1. **Never use localStorage** for the access token — it's stored in memory for XSS safety
2. **Never send `hospital_id` in request bodies** — backend reads it from JWT automatically
3. **Role enforcement is on the backend** — frontend role hiding is UX only
4. All fees in receipts come from the **appointment snapshot**, not current doctor fees
>>>>>>> 45b8192 (Initial commit : Set up hospital app structure)
