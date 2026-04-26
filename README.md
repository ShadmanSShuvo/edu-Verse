# eduVerse 🚀

![eduVerse landing page](public/landing-page.gif)

**eduVerse** is a sophisticated, role-based e-learning platform engineered with modern web technologies: **Next.js 16.2**, **React 19.2**, and **PostgreSQL**. It delivers a seamless educational experience for Students, Instructors, and Administrators, featuring AI-powered tools, adaptive video streaming, and secure localized payments.

---

### 🌐 Live Explore the Platform

[https://eduverse2026.vercel.app/](https://eduverse2026.vercel.app/)

---

## ER Diagram

```mermaid
erDiagram

%% ========================
%% USER & ROLE SYSTEM
%% ========================
USER {
  int user_id PK
  string name
  string email
  string phone_no
  datetime created_at
}

ROLE {
  int role_id PK
  string name
}

PERMISSION {
  int perm_id PK
  string name
}

USER ||--o{ USER_ROLE : has
ROLE ||--o{ USER_ROLE : assigned
ROLE ||--o{ ROLE_PERM : grants
PERMISSION ||--o{ ROLE_PERM : included

%% ========================
%% STUDENT & INSTRUCTOR
%% ========================
STUDENT {
  int student_id PK
}

INSTRUCTOR {
  int instructor_id PK
  string bio
}

USER ||--|| STUDENT : "User_Std"
USER ||--o| INSTRUCTOR : "User_Inst"

%% ========================
%% COURSE STRUCTURE
%% ========================
COURSE {
  int course_id PK
  string title
  string description
  float price
}

SUBJECT {
  int subject_id PK
  string subject_name
}

MODULE {
  int module_id PK
  string title
  string description
}

MATERIAL {
  int material_id PK
  string name
  string url
}

MATERIAL_TYPE {
  int type_id PK
  string type_name
}

COURSE ||--o{ MODULE : has
COURSE ||--o{ SUBJECT : categorized
MODULE ||--o{ MATERIAL : contains
MATERIAL ||--o{ MATERIAL_TYPE : typed

INSTRUCTOR ||--o{ COURSE : instructs

%% ========================
%% ENROLLMENT & PAYMENT
%% ========================
ENROLLMENT {
  int enrollment_id PK
  date date
  float progress
}

ORDER {
  int order_id PK
  datetime placed_at
}

PAYMENT {
  int payment_id PK
  float amount
  string status
  string method
  datetime time
  string transaction_id
}

STUDENT ||--o{ ENROLLMENT : enrolls
COURSE ||--o{ ENROLLMENT : contains

STUDENT ||--o{ ORDER : places
ORDER ||--|| PAYMENT : generates
ORDER ||--o{ COURSE : course_order

%% ========================
%% EXAM SYSTEM
%% ========================
EXAM {
  int exam_id PK
  string title
  int marks
  int duration
}

QUESTION {
  int ques_id PK
  string ques_statement
  string options
  string correct_ans
}

ATTEMPT {
  int attempt_id PK
  datetime time
  float score
}

RESPONSE {
  int response_id PK
  string response_text
}

MODULE ||--o{ EXAM : has
EXAM ||--o{ QUESTION : contains
STUDENT ||--o{ ATTEMPT : makes
EXAM ||--o{ ATTEMPT : attempted

ATTEMPT ||--o{ RESPONSE : has
QUESTION ||--o{ RESPONSE : answered

%% ========================
%% REVIEW SYSTEM
%% ========================
REVIEW {
  int review_id PK
  int rating
  string review_text
}

STUDENT ||--o{ REVIEW : writes
COURSE ||--o{ REVIEW : receives

%% ========================
%% COMMENT SYSTEM
%% ========================
COMMENT {
  int comment_id PK
  string comment_text
  datetime time
}

REPLY {
  int reply_id PK
}

USER ||--o{ COMMENT : writes
MODULE ||--o{ COMMENT : has
COMMENT ||--o{ REPLY : has
```

---

## ✨ Key Highlights

- **🤖 AI-Powered Intelligence**: 
  - **Auto Exam Builder**: Instantly generate high-quality MCQ exams from any text prompt using Google Gemini.
  - **Intelligent Chatbot**: A persistent AI assistant to help students and instructors navigate the platform and course content.
- **🛡️ Robust RBAC (Role-Based Access Control)**: 
  - Centralized security via `proxy.ts` enforcing role-specific access for Students, Instructors, and Admins.
  - Dedicated authentication middleware for API and Page routes.
- **📽️ Adaptive Video Streaming**: 
  - Integrated with **Mux** for buffer-free, adaptive bitrate playback.
  - Automatic asset synchronization via Mux Webhooks.
- **💳 Secure Local Payments**: 
  - Seamless integration with **SSLCommerz** for BDT transactions.
  - Schema-first validation (Zod) for all payment gateway responses.
- **🎓 Comprehensive Learning Management**: 
  - Full lifecycle management of Courses, Modules, and Materials.
  - Support for diverse materials: Videos, PDFs, Slides, and external links.
- **👨‍🏫 Subject-Specialized Instructors**: Instructors are assigned specific academic domains (Subjects), filtering their dashboard and course views to their area of expertise.
- **📊 Real-time Dashboard & Analytics**: Dynamic stats for tracking student enrollment, exam attempts, and course performance metrics.
- **✨ Premium UX/UI Transitions**: Specialized `PageTransitionProvider`, `HeroReveal`, and `ScrollReveal` components powered by **GSAP 3** and **Framer Motion 12**.
- **🛡️ Secure Exams**: Automated proctoring via DB-level constraints, ensuring students are enrolled before accessing exam sessions.
- **🌑 Dark Mode Architecture**: Premium UI built with **Tailwind CSS 4** and native dark mode support across every module.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.2.1](https://nextjs.org/) (App Router & Server Actions)
- **AI Integrations**: [Google Gemini Pro AI](https://deepmind.google/technologies/gemini/), [Vercel AI SDK](https://sdk.vercel.ai/)
- **Streaming**: [Mux](https://www.mux.com/) (HLS Adaptive Streaming)
- **Payments**: [SSLCommerz](https://www.sslcommerz.com/) (Sandbox & Live)
- **Frontend**: [React 19.2.3](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion 12](https://www.framer.com/motion/), [GSAP 3](https://gsap.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Raw SQL via `pg` pool — **No ORM**)
- **Storage**: [Supabase Storage](https://supabase.com/storage) for course materials (Videos, Thumbnails, PDFs)
- **Authentication**: Custom session management with HTTP-only cookies and cryptographic security.
- **Validation**: [Zod](https://zod.dev/) for robust schema-first data integrity.

---

## 👥 Roles & Responsibilities

### 📖 Student
- Explore the course catalog with advanced price and rating filters.
- Secure enrollment and track learning progress dynamically (0-100%).
- Engage with an AI-powered personal tutor via real-time chat.
- Take interactive exams with instant grading and performance history.

### 👨‍🏫 Instructor
- **Subject Specialization**: Mandatory subject assignment to focus content creation and analytics.
- **Course Studio**: Manage modules, upload materials (HLS Videos via Mux), and create rich course descriptions.
- **AI Exam Builder**: Generate diverse exams instantly via AI or build them manually using the MCQ editor.
- **Analytics Hub**: Track recent student activity, average scores, and individual course enrollment trends.

### 🛡️ Administrator
- **Platform Governance**: Full oversight of users, instructors, subjects, and platform-wide course catalog.
- **System Metrics**: High-level reporting on platform growth and user engagement.
- **Administrative Setup**: Controlled bootstrap mechanism for specialized roles.

---

## 📂 Project Architecture

```text
app/                  # App Router: Dashboards, Exams, Courses, and Auth
components/           # Premium, theme-aware UI components and GSAP animations
  ui/                 # Low-level primitives (Radix, HeroReveal, ScrollReveal)
  top-loader.tsx      # NavigationProgressBar for platform transitions
db/                   # Database access layer organized by entity
  schemas.ts          # Central Zod validation repository
  schema.psql         # Raw SQL table definitions
lib/                  # Core utilities: Mux, SSLCommerz, Session, and AI Logic
public/               # Static assets and media
migrations/           # Raw SQL migration scripts
proxy.ts              # Central security gate and Middleware for RBAC enforcement
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL instance (Supabase recommended)
- Mux Account (for Video)
- SSLCommerz Sandbox (for Payments)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database & Storage
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXT_PUBLIC_SUPABASE_URL="https://your-proj.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Admin & Instructor setup secrets
ADMIN_SETUP_SECRET="your-admin-key"
INSTRUCTOR_SIGNUP_SECRET="your-instructor-key"

# AI & LLMs 
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-key"

# Mux (Video Streaming)
MUX_TOKEN_ID="..."
MUX_TOKEN_SECRET="..."
MUX_WEBHOOK_SECRET="..."

# SSLCommerz (Payments)
SSLCOMMERZ_STORE_ID="..."
SSLCOMMERZ_STORE_PASSWORD="..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Initialize Database
# 1. Run /db/schema.psql and /db/analytics_functions.sql in your DB console
# 2. Run migrations in /migrations selectively

# Start Development Server
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to explore the platform.

---

## 🔒 Security & Performance
- **Custom Auth**: Direct session-to-DB mapping avoids third-party latency and keeps data sovereign.
- **SQL Optimization**: Parallel query execution using `pg` Pool and optimized PostgreSQL functions for analytics.
- **Cache Strategy**: Extensive use of `unstable_cache` and React `cache` to minimize database hits on read-heavy dashboards.
- **Streaming Webhooks**: Reliable status synchronization between Mux and the local DB via signed webhooks.

---

## 📄 License
Copyright © 2026 eduVerse. All rights reserved.
