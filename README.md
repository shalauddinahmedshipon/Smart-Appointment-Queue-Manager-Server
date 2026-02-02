# Smart Appointment & Queue Manager (Server)

Multi Organization support modern web application for managing appointments, staff availability, and customer waiting queues with smart conflict detection and auto-assignment.

Live Demo  
**Frontend:** https://smart-appointment-queue-manager-cli.vercel.app  
**Backend API:** https://smart-appointment-queue-manager-server-5gix.onrender.com  
**API Documentation (Swagger):** https://smart-appointment-queue-manager-server-5gix.onrender.com/docs

**Frotend Repo:** https://github.com/shalauddinahmedshipon/Smart-Appointment-Queue-Manager-Client


## Project Links

- **Entity Relationship Diagram (interactive):**  
  https://lucid.app/lucidchart/4511713b-ffd1-4377-9353-d8f07f013156/edit?invitationId=inv_0c89aa63-c211-4ec2-ad0b-ed2aed6d6fce

- **ERD Screenshot:**  
  ![Smart Appointment Queue Manager ERD](https://res.cloudinary.com/drxigac9l/image/upload/v1770030729/Blank_diagram_xenpwk.png)

## Features

- **Secure Authentication** — Email + Password login/signup + demo credentials button
- **Staff Management** — Create/edit staff with name, type (Doctor/Consultant/Support), daily capacity & availability
- **Service Catalog** — Define services with name, duration (15/30/60 min) and required staff type
- **Appointment CRUD** — Create, view, edit, cancel appointments with customer name, service, staff, date/time
- **Smart Staff Assignment** — Auto-assign available staff → shows load (e.g. 3/5 today) → falls back to waiting queue
- **Conflict Prevention** — Real-time overlap detection per staff member + duration-aware checks
- **Waiting Queue** — Ordered by time, shows position, auto-assign when staff becomes free (manual trigger supported)
- **Dashboard Overview** — Today's appointments, completed/pending stats, queue count, staff load summary (OK/Booked)
- **Activity Log** — Tracks queue → staff assignments and important actions (latest 5–10 shown)
- **Automatic Status Updates** — Appointments auto-complete when finished, expired queue items auto-cancelled

## Tech Stack

**Backend**
- NestJS (TypeScript)
- PostgreSQL + Prisma ORM
- JWT Authentication
- Swagger / OpenAPI docs

**Frontend**
- Next.js (TypeScript)
- Redux Toolkit + RTK Query
- shadcn/ui components
- Tailwind CSS
- react-hook-form + Zod validation



## Quick Start (Local)

```bash
# Backend
git clone https://github.com/shalauddinahmedshipon/Smart-Appointment-Queue-Manager-Server
cd backend
npm install
cp .env.example .env
# edit DATABASE_URL, JWT_SECRET...
npm run prisma:generate
npm run prisma:db-push    # or migrate dev
npm run dev

# Frontend (in separate terminal)
git clone https://github.com/shalauddinahmedshipon/Smart-Appointment-Queue-Manager-Client
cd frontend
npm install
npm run dev
