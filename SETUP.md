# KW APPS - Setup Guide

Complete setup instructions for running KW APPS locally and deploying to production.

---

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Supabase Account** (free tier works)
- **DeepSeek API Key** (for AI code generation)
- **Git** (for version control)

---

## 🚀 Quick Start (5 Minutes)

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to **Project Settings** → **API**
4. Copy your credentials:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Configure Environment Variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace:
- `NEXT_PUBLIC_SUPABASE_URL` with your Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon key
- `SUPABASE_SERVICE_ROLE_KEY` with your service_role key

### 4. Run Database Migrations

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Click **New query**
3. Copy the contents of `/supabase/migrations/001_add_admin_roles.sql`
4. Paste and click **Run**

This will create:
- Admin roles and permissions system
- Users table with admin fields
- Audit logging tables
- Impersonation tracking
- Helper functions and RLS policies

### 5. Configure Google OAuth (Optional)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URL: `http://localhost:3000/auth/callback`

### 6. Create Your First Admin User

After running migrations, you'll need to manually make your first user an admin:

1. Sign up through the app at `http://localhost:3000/signup`
2. In Supabase dashboard, go to **Table Editor** → **users**
3. Find your user record
4. Set:
   - `is_admin` = `true`
   - `admin_role` = `owner`

### 7. Start Development Server

```bash
npm run dev
```

Visit:
- Admin panel: `http://localhost:3000/admin`
- Login page: `http://localhost:3000/login`
- Signup page: `http://localhost:3000/signup`

## Project Structure

```
/src
  /app
    /(auth)           # Authentication pages (login, signup)
      /login
      /signup
    /admin            # Admin panel
      /users          # User management
      /projects       # Projects monitoring
      /templates      # Templates CMS
      /billing        # Billing & revenue
      /content        # Content CMS
      /health         # System health
      /feature-flags  # Feature flags
      /announcements  # Announcements
    /auth
      /callback       # OAuth callback handler
    /actions          # Server actions
      auth.ts         # Auth actions
  /components
    /admin            # Admin-specific components
    /ui               # shadcn/ui components
  /lib
    /auth             # Auth utilities
    /supabase         # Supabase client

/supabase
  /migrations         # Database migrations
```

## Admin Roles

The system supports 4 admin roles:

1. **Owner** - Full access to everything
2. **Support** - User management, project viewing, system logs
3. **Content** - Templates, blog posts, announcements
4. **Readonly** - View-only access

## Features Implemented

### Phase 1: Authentication ✅
- Email/password authentication
- Google OAuth integration
- Smart redirects based on user type
- Middleware protection
- Role-based access control

### Phase 2: Admin Layout ✅
- RTL sidebar navigation
- Admin header with user info
- Protected admin routes
- Dashboard overview page

### Next Steps

- Phase 3: Shared components (DataTable, Forms, Charts)
- Phase 4: User Management feature
- Phase 5: System Health & Logs
- Phase 6: Templates CMS
- Phase 7: Projects Monitoring
- Phase 8: Billing & Revenue Analytics

## Troubleshooting

### Supabase errors

If you see "Your project's URL and Key are required":
- Check that `.env.local` exists and has valid Supabase credentials
- Restart the dev server after changing environment variables

### Database errors

If you see RLS policy errors:
- Make sure you ran the database migration
- Check that your user has `is_admin = true` in the database

### OAuth errors

If Google login doesn't work:
- Configure Google OAuth in Supabase dashboard
- Check redirect URL matches `NEXT_PUBLIC_SITE_URL/auth/callback`
