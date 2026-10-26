# Lincoz Enterprise — Vercel 1-Click Deployment Guide

This project is fully configured for unified **Full-Stack deployment on Vercel** (React Frontend + Express Serverless API + Supabase PostgreSQL).

---

## 🚀 How to Deploy to Vercel

### Method 1: Deploy via GitHub (Recommended)

1. **Initialize Git & Push to GitHub**:
   In your project directory terminal:
   ```bash
   git init
   git add .
   git commit -m "feat: configure full-stack vercel deployment with supabase"
   ```
   Create a new repository on [GitHub](https://github.com/new) and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository and click **Import**.

3. **Configure Environment Variables**:
   Under the **Environment Variables** section, add the following variables:

   | Key | Value |
   | :--- | :--- |
   | `DATABASE_URL` | `postgresql://postgres.rdhinfgppvybemqbjjrz:lincozusman@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
   | `DIRECT_URL` | `postgresql://postgres.rdhinfgppvybemqbjjrz:lincozusman@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres` |
   | `JWT_SECRET` | `lincoz_enterprise_super_secret_jwt_key_minimum_32_characters_long` |
   | `JWT_REFRESH_SECRET` | `lincoz_enterprise_super_secret_jwt_refresh_key_minimum_32_characters_long` |
   | `NODE_ENV` | `production` |

4. **Click Deploy**:
   Vercel will automatically:
   - Install dependencies
   - Run `prisma generate` to compile the database engine
   - Build the Vite React frontend into `dist/`
   - Deploy `api/index.js` as an auto-scaling serverless function
   - Provide your live HTTPS production URL (e.g., `https://your-project.vercel.app`)

---

### Method 2: Deploy via Vercel CLI

If you prefer deploying straight from your computer without GitHub:

```bash
# 1. Install or run Vercel CLI
npx vercel

# 2. Follow the interactive prompts:
# ? Set up and deploy? [Y]
# ? Which scope? [Select your account]
# ? Link to existing project? [N]
# ? What’s your project’s name? [project-managment-tool]
# ? In which directory is your code located? [./]

# 3. Add Environment Variables:
npx vercel env add DATABASE_URL production
npx vercel env add DIRECT_URL production
npx vercel env add JWT_SECRET production
npx vercel env add JWT_REFRESH_SECRET production

# 4. Deploy to production:
npx vercel --prod
```

---

## 🛡️ Architecture & Routing Details

- **Frontend**: Served from `/` through Vercel's Edge CDN.
- **Backend API**: All requests to `/api/*` are handled by `api/index.js` (Express.js Serverless Function).
- **Same-Origin (Zero CORS)**: Because both the client and server live under the same domain, no cross-origin restrictions apply.
- **Database**: Connected to **Supabase Cloud PostgreSQL** in AWS Seoul (`ap-northeast-2`) with Supavisor transaction connection pooling on port `6543`.
