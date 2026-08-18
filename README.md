# HomeNest
## Making Your House a Home

HomeNest is a full-stack residential apartment management platform designed for tenants, managers, contractors, and administrators.

## Features
- Secure JWT authentication with bcrypt password hashing
- Role-based authorization (`TENANT`, `MANAGER`, `CONTRACTOR`, `ADMIN`)
- Tenant registration, login, logout, profile updates, password change
- Building and apartment management
- Maintenance request lifecycle with updates and contractor assignment
- Payment tracking with proof upload and verification workflow
- Document upload and ownership-based access control
- Security report submission and status management
- Announcements with audience targeting
- Notifications with mark-as-read
- Role dashboards and analytics using real database data
- Audit logging for administrative actions

## Tech Stack
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, React Hook Form, Zod, TanStack Query, Recharts
- Backend: Node.js, Express, TypeScript, PostgreSQL (Neon-compatible), JWT, bcryptjs, Zod
- Database: Neon PostgreSQL
- Deployment target: Vercel (frontend and backend)

## Architecture
- Frontend calls backend REST API with cookie-based auth
- Backend architecture follows:
  - Routes
  - Controllers
  - Services
  - Repositories / Database

## Folder Structure
- `Frontend/` - Next.js frontend
- `Backend/` - Express backend

## Environment Variables
### Frontend (`Frontend/.env`)
Copy from `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### Backend (`Backend/.env`)
Copy from `.env.example`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
COOKIE_NAME=homenest_token
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=8
```

## Backend Setup
1. Install dependencies:
```bash
cd Backend
npm install
```

2. Run migrations:
```bash
npm run migrate
```

3. Seed demo data:
```bash
npm run seed
```

4. Start backend in development:
```bash
npm run dev
```

## Frontend Setup
1. Install dependencies:
```bash
cd Frontend
npm install
```

2. Start frontend:
```bash
npm run dev
```

## Backend Scripts
- `npm run dev` - run API in watch mode
- `npm run build` - compile TypeScript
- `npm run start` - run compiled server
- `npm run migrate` - create/update tables and indices
- `npm run seed` - populate demo data
- `npm run typecheck` - TypeScript checks

## Frontend Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Demo Credentials
All demo users use this development password:
- `HomeNest@123`

Accounts:
- `admin@homenest.demo`
- `manager@homenest.demo`
- `contractor@homenest.demo`
- `tenant@homenest.demo`

## API Overview
Primary endpoints:
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/me`
- `/api/auth/change-password`
- `/api/users`
- `/api/buildings`
- `/api/apartments`
- `/api/maintenance`
- `/api/contractors`
- `/api/payments`
- `/api/documents`
- `/api/security-reports`
- `/api/announcements`
- `/api/notifications`
- `/api/dashboard`
- `/api/reports`
- `/api/audit-logs`

## Security Notes
- Public registration always creates a `TENANT` account; role input is ignored
- Passwords are hashed with bcrypt before storage
- Auth token is stored in HTTP-only cookie
- Protected routes require valid JWT
- Role middleware enforces authorization
- Ownership checks prevent cross-tenant data access
- Security middleware includes `helmet`, CORS configuration, and auth rate limiting

## Deployment Notes
### Frontend (Vercel)
- Deploy `Frontend/`
- Set `NEXT_PUBLIC_API_BASE_URL` to backend public API URL

### Backend (Vercel)
- Deploy `Backend/`
- Ensure backend environment variables are set in Vercel
- `vercel.json` routes requests to `src/server.ts`

### Database (Neon)
- Provision Neon PostgreSQL
- Set `DATABASE_URL`
- Run migration and seed commands against target database
