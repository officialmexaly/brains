# Authentication & Database Setup Guide

## Step 1: Configure Social Logins in Supabase

### Google OAuth Setup

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Web application
   - Authorized redirect URIs: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

2. **Configure in Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google
   - Paste Client ID and Client Secret
   - Save

### GitHub OAuth Setup

1. **Create GitHub OAuth App:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Application name: Brain App
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Register application
   - Copy Client ID and Client Secret

2. **Configure in Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable GitHub
   - Paste Client ID and Client Secret
   - Save

---

## Step 2: Configure Site URL

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL**: `http://localhost:3000` (development) or your production URL
3. Add **Redirect URLs**:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/login`
   - `http://localhost:3000/signup`
   - Your production URLs (if applicable)

---

## Step 3: Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/complete_schema_with_auth.sql`
3. Paste and run the migration
4. Verify tables created with `user_id` columns

---

## Step 4: Create Test User (Optional)

You can create a test user via:

**Option A: Signup Page**
- Navigate to `/signup`
- Enter email: `ejise45@gmail.com`
- Set password
- Complete signup

**Option B: Supabase Dashboard**
- Go to Authentication → Users
- Click "Add user"
- Enter email: `ejise45@gmail.com`
- Set password
- Confirm email (optional)

---

## Step 5: Test Social Logins

1. Navigate to `/login`
2. Click "Google" or "GitHub" button
3. Complete OAuth flow
4. Should redirect to `/dashboard`
5. User created automatically in Supabase

---

## Verification Checklist

- [ ] Google OAuth configured in Supabase
- [ ] GitHub OAuth configured in Supabase
- [ ] Site URL and redirect URLs configured
- [ ] Database migration run successfully
- [ ] Tables have `user_id` columns
- [ ] RLS policies are user-specific
- [ ] Test user created (ejise45@gmail.com)
- [ ] Social login buttons work
- [ ] Email/password login works
- [ ] Protected routes redirect correctly

---

## Important Notes

- **Development:** Use `http://localhost:3000` for local testing
- **Production:** Update URLs to your production domain
- **OAuth Redirect:** Must match exactly in both provider and Supabase
- **RLS:** All data is now user-specific (isolated per user)
- **Middleware:** Automatically protects all routes except auth pages

---

## Troubleshooting

### Social Login Not Working
- Check OAuth credentials are correct
- Verify redirect URLs match exactly
- Check browser console for errors
- Ensure providers are enabled in Supabase

### Data Not Showing
- Verify user is authenticated
- Check RLS policies are applied
- Ensure `user_id` is set on data creation
- Check browser console for Supabase errors

### Redirect Issues
- Verify Site URL in Supabase settings
- Check middleware configuration
- Ensure redirect URLs are whitelisted
