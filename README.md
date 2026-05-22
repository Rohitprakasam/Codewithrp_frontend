# CodeWithRP

Welcome to **CodeWithRP**, a developer-focused, web-based coding practice platform designed for students and administrators to practice programming, track submissions, and manage coding problems exclusively in **Java**.

---

## 🚀 Technology Stack

### Frontend (code-haven)
*   **Framework**: [TanStack Start](https://tanstack.com/router) & Vite
*   **Library**: **React 19** & **TypeScript 5.8**
*   **Styling**: **Tailwind CSS v4**
*   **Icons & Animation**: **Lucide React** & **Framer Motion**
*   **Code Editor**: **@monaco-editor/react**
*   **State Management**: **TanStack Query (React Query) v5**
*   **Deployment**: **Vercel**

### Backend (codepit-backend)
*   **Runtime**: **Node.js** & **Express**
*   **Language**: **TypeScript**
*   **Database**: **PostgreSQL** (via Supabase)
*   **Authentication**: **JWT (JSON Web Tokens)**
*   **Execution Engine**: Local **Java (JDK)** compilation and execution via `child_process`
*   **Deployment**: **Render**

---

## 🛠️ Key Features

### 1. Multi-role Authentication
Sign in as either a **Student** or an **Admin** via the Login Portal.
*   **Demo Student**: `student@test.com` / `123456`
*   **Demo Admin**: `admin@test.com` / `123456`

### 2. Student Dashboard
A customized statistics panel showing:
*   Streak count with glowing flame animation.
*   Acceptance percentages and submission counters.
*   Problem registry catalog.
*   Recent submission status feed.

### 3. Interactive Code Editor & Runner (Java Only)
Solving a problem yields a split-panel interface:
*   **Left Panel**: Problem descriptions, examples, constraints, and testcase values.
*   **Right Panel**: Monaco Editor, Java syntax highlighting, and a console containing interactive output fields, compilation execution logs, runtimes, and validation flags.
*   *Note: All submissions must contain `public class Main` as the entry point.*

### 4. Admin Portal
Administrative workflows enabling:
*   Comprehensive student submission log checks with code viewer modals.
*   Visual dashboard metrics.
*   A form-validation-powered **Problem Creator** supporting title, difficulty, Markdown description, default starter code templates, and testcase additions (separate visible/hidden testcases).

---

## 💻 Local Development Setup

### 1. Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase `DATABASE_URL` and `JWT_SECRET`.
4. Ensure you have the Java JDK installed (`javac` and `java` in your PATH).
5. Start the backend: `npm run dev` (Runs on `http://localhost:5000`)

### 2. Frontend Setup
1. Navigate to the `code-haven` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file with `VITE_API_URL=http://localhost:5000`
4. Start the frontend: `npm run dev` (Runs on `http://localhost:8080`)

---

## 🚢 Deployment Guides

### Frontend (Vercel)
The frontend is pre-configured as a Single Page Application (SPA) for Vercel deployment.
1. Run `npm install -g vercel`
2. Run `vercel login`
3. In `code-haven/`, run `vercel`
4. When prompted, link to your project. Add the `VITE_API_URL` environment variable pointing to your deployed backend.

### Backend (Render)
The backend requires a Java runtime environment, so it uses the included `Dockerfile`.
1. Push your backend code to GitHub.
2. On Render, create a new "Web Service" connected to your GitHub repo.
3. Select the `Dockerfile` environment.
4. Add environment variables for `DATABASE_URL` and `JWT_SECRET`.
5. Deploy.

