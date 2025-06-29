Here's your **updated `README.md`** with the `.env.sample` format you shared:

---

# 🧠 Knowledge Base Platform

A **Confluence-style** collaborative documentation system built with **Next.js**, **PostgreSQL**, **Prisma**, and **JWT authentication**. Designed for teams to write, share, and manage knowledge-rich documents.

---

## ✨ Features

* 🔐 **JWT Auth** – Login, Register, Forgot Password
* 📝 **Rich Text Editor** – Tiptap with inline editing
* 📂 **Public/Private Documents**
* 🔗 **Document Sharing** – View/Edit permissions
* 🧠 **User Mentions** – Auto-share on `@username`
* 🕓 **Version History**
* 🔍 **Global Search**
* 📬 **Email Reset Link via Resend**

---

## 📦 Tech Stack

| Layer    | Stack                             |
| -------- | --------------------------------- |
| Frontend | Next.js (App Router), TailwindCSS |
| Backend  | API Routes (Next.js)              |
| DB       | PostgreSQL + Prisma ORM           |
| Auth     | JWT + HTTP-only cookies           |
| Editor   | Tiptap                            |
| Email    | Resend or SMTP                    |

---

## 🚀 Local Development Setup

### 1️⃣ Clone and install dependencies

```bash
git clone https://github.com/yourusername/knowledge-base-platform.git
cd knowledge-base-platform
npm install
```

---

### 2️⃣ Create `.env` file

Copy the `.env.sample` and configure:

```bash
cp .env.sample .env
```

### ✏️ `.env.sample`

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/knowledgebase
JWT_SECRET="supersecretkey"
NEXT_PUBLIC_BASE_URL=http://localhost:3000
RESEND_API_KEY=your-resend-key
EMAIL_FROM=no-reply@yourdomain.com
APP_URL=http://localhost:3000
```

> ✅ **Note**: Use [Resend](https://resend.com/) for email or configure your own SMTP if needed.

---

### 3️⃣ Set up PostgreSQL

Ensure PostgreSQL is running locally:

```bash
createdb knowledgebase
npx prisma migrate dev --name init
npx prisma generate
```

To open Prisma Studio:

```bash
npx prisma studio
```

---

### 4️⃣ Start the dev server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🗃 Project Structure

```
/
├── app/                  # App Router pages
│   ├── documents/        # Editor, view, share
│   ├── api/              # REST APIs (auth/docs)
│   └── login/register/   # Auth routes
├── components/           # UI components
├── lib/                  # DB, auth utils
├── prisma/               # Schema & migrations
├── types/                # Shared types
├── public/               # Static assets
└── styles/               # Global + Tailwind styles
```

---

## 🧪 Testing

* Use `/login` and `/register` to create users
* Create docs from `/documents/new`
* Mention others using `@username`
* Try version history and sharing

---

## 🧾 Scripts

| Script              | Action                   |
| ------------------- | ------------------------ |
| `npm run dev`       | Start local dev server   |
| `npm run build`     | Build app for production |
| `npm run start`     | Start prod server        |
| `npx prisma studio` | Visual DB access         |

---

## 🚢 Production Grade Deployment

* **Frontend/Backend**: [Vercel](https://vercel.com/) (Next.js native)
* **Database**: [Supabase](https://supabase.io/) or [Neon](https://neon.tech/)
* Use environment variables securely on platform

---

## 🧠 Tips

* Documents created by you are always editable
* Shared docs (public/private) support permissions
* Mentions auto-trigger sharing

---




