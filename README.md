<div align="center">

# 🍕 ShiftPizza

**Full stack employee & schedule management system for small businesses**

[![Live Demo](https://img.shields.io/badge/🍕%20Live%20Demo-shiftpizza.vercel.app-FF6B35?style=for-the-badge)](https://shiftpizza.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge)](LICENSE)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Preview](#-preview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Author](#-author)

---

## 🧠 About

ShiftPizza tackles a real, common problem in small businesses: team schedules that still live in scattered notes, WhatsApp messages, and last-minute paper changes. This system consolidates the full workflow into a single application — from employee registration and monthly schedule generation to absence tracking, overtime shifts, and vacation management.

Built as a full stack portfolio project, the focus was intentional architecture: clean separation between frontend and backend, JWT authentication, Argon2 password hashing, role-based access control, DTO validation, and a demo experience that's frictionless from the first click.

**Key technical decisions:**
- NestJS modules with clear separation of concerns — `auth`, `employees`, `schedules`, `shifts`
- Prisma ORM with PostgreSQL hosted on Neon (serverless, zero cold-start overhead)
- JWT access tokens with role guards protecting every sensitive route
- Argon2 for password hashing — stronger resistance to GPU attacks than bcrypt
- Demo reset endpoint that restores seed state without re-deployment

---

## 🎬 Preview

<div align="center">

![ShiftPizza Demo](docs/media/apresentation.gif)

</div>

---

## 📸 Screenshots

| Login | Admin Dashboard | Employee Dashboard |
|:---:|:---:|:---:|
| ![Login](docs/media/logindemo.png) | ![Admin](docs/media/admindashboard.png) | ![Employee](docs/media/dashboardemployee.png) |

> **Login screen** — demo credentials and quick-access buttons are displayed directly, reducing friction for reviewers. **Admin panel** — shows active employees, absences, recent activity, and shortcuts to all key areas. **Employee panel** — personal schedule view focused on upcoming shifts, absences, and manual changes.

---

## ✨ Features

### 🔐 Admin Panel

| Feature | Description |
|---|---|
| 👤 Employee management | Register, edit, and remove employees with full profile control |
| 📅 Schedule generation | Create and organize monthly work schedules |
| ❌ Absence tracking | Log and monitor absences per employee |
| ⏰ Extra shifts | Add and control overtime or replacement shifts |
| 🏖️ Vacation control | Manage and visualize vacation periods |
| 📊 Activity feed | Track recent actions across the system |
| 🔄 Demo reset | Restore the demo environment to its original seeded state |

### 👷 Employee Panel

| Feature | Description |
|---|---|
| 📆 Personal schedule | View own upcoming shifts and work days |
| 🗂️ Profile data | Access own registration and contact details |
| 📋 Absence history | See personal absence records |

### 🎭 Demo Experience

- One-click demo login directly from the login screen
- Pre-loaded credentials for both **admin** and **employee** roles
- Full environment reset available at any time — no re-deployment needed

---

## 🛠 Tech Stack

### Frontend

| Technology | Role |
|---|---|
| **React + Vite** | UI framework and lightning-fast build tool |
| **TypeScript** | Type safety across all components and services |
| **Tailwind CSS** | Utility-first styling system |
| **React Router DOM** | Client-side routing with protected routes |
| **Axios** | HTTP client with interceptors for auth headers |

### Backend

| Technology | Role |
|---|---|
| **NestJS** | Modular, decorator-based backend framework |
| **TypeScript** | Strict typing on all layers — DTOs, services, guards |
| **Prisma ORM** | Type-safe database access and schema migrations |
| **JWT** | Stateless authentication with role-based guards |
| **Argon2** | Secure password hashing |
| **class-validator** | Automatic DTO validation on all incoming payloads |

### Infrastructure

| Technology | Role |
|---|---|
| **PostgreSQL** | Relational database |
| **Neon** | Serverless PostgreSQL hosting |
| **Vercel** | Frontend deployment with automatic CI from GitHub |

---

## 🏗 Architecture

```
shiftpizza/
├── frontend/                 # React + Vite
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route-level views (Login, Dashboard, etc.)
│       ├── services/         # Axios API calls per domain
│       └── context/          # Global auth context
│
└── backend/                  # NestJS
    ├── src/
    │   ├── auth/             # JWT strategy, guards, login logic
    │   ├── employees/        # Employee CRUD + DTO validation
    │   ├── schedules/        # Monthly schedule generation
    │   ├── shifts/           # Shift and absence management
    │   └── prisma/           # PrismaService (shared DB client)
    └── prisma/
        ├── schema.prisma     # Database schema
        └── seed.ts           # Demo data seeder
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or a [Neon](https://neon.tech) connection string)

### Backend

```bash
cd backend
npm install
cp .env.example .env        # Set DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # Set VITE_API_URL
npm run dev
```

> **Don't want to run locally?** Visit [shiftpizza.vercel.app](https://shiftpizza.vercel.app) — demo credentials are displayed right on the login screen.

---

## 👤 Author

<table>
  <tr>
    <td>
      <strong>Anthony Diniz Sepini Azevedo</strong><br/>
      Full stack developer focused on clean architecture, real business problems, and strong visual and technical presentation.
      <br/><br/>
      <a href="https://github.com/anthonysepini" target="_blank">
        <img src="https://img.shields.io/badge/GitHub-anthonysepini-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
      </a>
      &nbsp;
      <a href="https://www.linkedin.com/in/anthonysepini" target="_blank">
        <img src="https://img.shields.io/badge/LinkedIn-anthonysepini-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
    </td>
  </tr>
</table>

---

<div align="center">

Built with focus on architecture, not just code.

</div>
