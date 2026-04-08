<div align="center">

# 🍕 ShiftPizza

**Employee and schedule management for small businesses — built because WhatsApp groups aren't systems.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-shiftpizza.vercel.app-FF6B35?style=for-the-badge&logo=vercel&logoColor=white)](https://shiftpizza.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge)](LICENSE)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## What this is

Most small businesses still track team schedules through a WhatsApp group and a notepad. Someone doesn't show up because they saw a different message. Someone works an extra shift that nobody recorded. Vacations disappear.

ShiftPizza replaces that. Admins manage the full team — schedules, absences, extra shifts, vacations — and each employee gets their own dashboard to check their own data. No group chat. No paper.

The demo resets on demand, so you can break it as many times as you want.

**[→ Try it at shiftpizza.vercel.app](https://shiftpizza.vercel.app)** — credentials are right on the login screen.

---

## Preview

<div align="center">

![ShiftPizza Demo](docs/media/apresentation.gif)

</div>

---

## Screenshots

| Login | Admin Dashboard | Employee Dashboard |
|:---:|:---:|:---:|
| ![Login](docs/media/logindemo.png) | ![Admin](docs/media/admindashboard.png) | ![Employee](docs/media/dashboardemployee.png) |

---

## What it does

**Admin**
- Register, edit, and remove employees (name, CPF, phone, role, password)
- Generate and manage monthly schedules
- Log absences and extra shifts
- Control vacation periods
- View a real-time activity feed
- Reset the entire demo environment without redeploying

**Employee**
- See their own schedule and upcoming shifts
- View their absence history
- Access their own profile data

---

## Technical decisions

**Why NestJS?** I wanted a backend with actual structure — modules, guards, decorators, dependency injection — not a flat Express app with everything in one file. NestJS forces you to organize things.

**Why Argon2 over bcrypt?** Argon2 is more resistant to GPU-based brute-force attacks. It's what OWASP recommends now. The extra setup was worth it.

**Why Neon for PostgreSQL?** Serverless database that doesn't have cold-start problems on the free tier. I didn't want to manage a VPS just to keep a demo alive.

**Why a server-side reset button?** I didn't want to redeploy every time someone wiped the seed data while testing. The reset endpoint re-runs the seeder on demand — the admin panel has a button for it.

---

## Tech stack

**Frontend**
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="18" alt="React" /> React
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="18" alt="Vite" /> Vite
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18" alt="TypeScript" /> TypeScript
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="18" alt="Tailwind CSS" /> Tailwind CSS
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="18" alt="CSS" /> CSS
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" width="18" alt="Axios" /> Axios
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg" width="18" alt="React Router DOM" /> React Router DOM

**Backend**
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" width="18" alt="NestJS" /> NestJS
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18" alt="TypeScript" /> TypeScript
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="18" alt="Prisma ORM" /> Prisma ORM
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="18" alt="Node.js" /> Node.js
- <img src="https://jwt.io/img/pic_logo.svg" width="18" alt="JWT" /> JWT
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18" alt="class-validator" /> class-validator
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18" alt="Argon2" /> Argon2

**Infrastructure**
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="18" alt="PostgreSQL" /> PostgreSQL
- <img src="https://neon.com/brand/neon-logomark-dark-color.svg" width="18" alt="Neon" /> Neon
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="18" alt="HTML" /> HTML
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="18" alt="npm" /> npm



---

## Architecture

```
shiftpizza/
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level views
│       ├── services/       # Axios API calls per domain
│       └── context/        # Auth context with role awareness
│
└── backend/
    ├── src/
    │   ├── auth/           # JWT strategy, login, role guards
    │   ├── employees/      # CRUD + DTO validation
    │   ├── schedules/      # Monthly schedule generation
    │   ├── shifts/         # Shift and absence management
    │   └── prisma/         # Shared PrismaService
    └── prisma/
        ├── schema.prisma
        └── seed.ts
```

---

## Running locally

**Backend**

```bash
cd backend
npm install
cp .env.example .env     # DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL
npm run dev
```

---

## Author

<table>
  <tr>
    <td>
      <strong>Anthony Diniz Sepini Azevedo</strong><br/>
      Full stack developer. I like real problems, clean architecture, and code that still works when someone actually uses it.
      <br/><br/>
      <a href="https://github.com/anthonysepini">
        <img src="https://img.shields.io/badge/GitHub-anthonysepini-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
      </a>
      &nbsp;
      <a href="https://www.linkedin.com/in/anthonysepini">
        <img src="https://img.shields.io/badge/LinkedIn-anthonysepini-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
    </td>
  </tr>
</table>
