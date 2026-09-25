# Indian Railways - Automatic Block Planning System (ABPS)

Integrated Multi-Department Railway Block Planning Application powered by Next.js and Supabase.

---

## 🗄️ Database Setup (Supabase)

This application uses **Supabase** (`https://nbtwgbmqjjhvlryvatdn.supabase.co`) as its primary database.

### Step 1: Run the Database Schema in Supabase
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard/project/nbtwgbmqjjhvlryvatdn).
2. Click on **SQL Editor** in the left navigation sidebar.
3. Click **New query**.
4. Open [database/supabase_schema.sql](file:///d:/SIH/Request%20Format/railway-ai/database/supabase_schema.sql) in this repository, copy the full contents, paste it into the Supabase SQL editor, and click **Run**.
5. This will set up:
   - `block_requests` (Full maintenance block requests registry)
   - `departments` (Civil Engineering, TRD, Signal & Telecom)
   - `corridors`, `stations`, `corridor_stations`
   - Row Level Security (RLS) policies allowing secure reading and writing.

### Step 2: Configure Environment Variables
1. In your Supabase Dashboard, navigate to:
   **Project Settings** (gear icon) -> **API** -> **Project API keys**.
2. Copy the **`anon` `public`** key.
3. Open [frontend/.env.local](file:///d:/SIH/Request%20Format/railway-ai/frontend/.env.local) and set your key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://nbtwgbmqjjhvlryvatdn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Verify Supabase Connection
- Start the frontend server:
  ```bash
  cd frontend
  npm run dev
  ```
- Visit `http://localhost:3000/api/supabase-status` to test your connection. It will confirm whether your database tables are reachable and responsive.

---

## 🚀 Key Features & Architecture
- **Multi-Department Forms**: Dedicated maintenance request workflows for **Engineering** (`/request/engineering`), **TRD** (`/request/trd`), and **S&T** (`/request/snt`).
- **Zero-Latency Offline Fallback**: If network or credentials are temporarily unavailable, data seamlessly syncs with local persistent storage (`database/data/block_requests.json`).
- **REST & Supabase Client**: Native HTTP PostgREST client implementation without requiring heavy PostgreSQL binary dependencies.
