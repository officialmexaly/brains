# Quick Start Guide - Authentication Setup

## ✅ What's Already Done

All code is implemented! The authentication system is fully integrated into your app.

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Run Database Migration

Copy and run this in **Supabase SQL Editor**:

File: `supabase/migrations/add_user_id_to_existing_tables.sql`

This will:
- Add `user_id` column to all tables
- Create user-specific RLS policies
- Set up proper indexes

### Step 2: Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
4. In Supabase Dashboard → Authentication → Providers:
   - Enable Google
   - Paste Client ID and Secret

### Step 3: Configure GitHub OAuth (Optional)

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Callback URL: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
4. In Supabase Dashboard → Authentication → Providers:
   - Enable GitHub
   - Paste Client ID and Secret

### Step 4: Configure Site URL

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: Add `http://localhost:3000/dashboard`

---

## 🧪 Test It!

### Email/Password Signup
```
1. Navigate to http://localhost:3000/signup
2. Enter: ejise45@gmail.com
3. Set password
4. Click "Create account"
5. You're in! ✓
```

### Social Login (after OAuth setup)
```
1. Navigate to http://localhost:3000/login
2. Click "Google" or "GitHub"
3. Complete OAuth flow
4. Redirects to dashboard ✓
```

---

## ✨ What You Get

- **Protected Routes**: Unauthenticated users → `/login`
- **User Isolation**: Each user sees only their data
- **Social Logins**: Google & GitHub (after setup)
- **Session Management**: Auto-persists across reloads
- **UserMenu**: Sign out, settings access

---

## 🔍 Verify It Works

After signup/login:
1. Create a task → Only you can see it
2. Create a note → Only you can see it  
3. Sign out → Redirects to login
4. Sign in → Your data is still there

---

## 📝 Notes

- **Development**: Use `http://localhost:3000`
- **Production**: Update URLs to your domain
- **OAuth**: Optional but recommended
- **Migration**: Must run before testing

---

## 🆘 Troubleshooting

**Can't see data after login?**
- Check if migration ran successfully
- Verify RLS policies are applied
- Check browser console for errors

**Social login not working?**
- Verify OAuth credentials
- Check redirect URLs match exactly
- Ensure providers are enabled in Supabase

**Getting "not authenticated" errors?**
- Clear browser cache
- Sign out and sign in again
- Check Supabase connection

---

**Ready to go!** Run the migration and start testing 🚀
