# 🚨 CRITICAL: Supabase Configuration Required

The "Signups not allowed for otp" error means your Supabase project needs to be configured for magic link authentication.

## Step 1: Enable Email Signups in Supabase

1. **Go to your Supabase Dashboard** → https://supabase.com
2. **Navigate to Authentication** → Settings → Auth
3. **Find "Enable email signups"** and toggle it to **ON**
4. **Save the settings**

## Step 2: Configure Magic Link Settings

In the same Auth settings page:

1. **Enable email confirmations**: Toggle **OFF** (for magic links)
2. **Enable email autoconfirm**: Toggle **ON**
3. **Mailer OTP expiry**: Set to **900** (15 minutes)

## Step 3: Add Site URLs

1. **Go to Authentication** → Settings → URL Configuration
2. **Add your site URLs** to the allowed list:
   - `http://localhost:5173` (for development)
   - `https://veridaq.com` (your production domain)
   - Any other domains where your app is hosted

## Step 4: Test Magic Link Authentication

After making these changes:

1. Visit `https://veridaq.com/#cms`
2. Enter `dan@secureprivacy.ai` or `pal.schakonat@hyperisland.se`
3. Click "Send Secure Magic Link"
4. Check email for the authentication link
5. Click the link to access the CMS

## 🔐 Security Notes

- Even with signups enabled, only the whitelisted email addresses can actually authenticate
- The application code validates email addresses before allowing access
- All authentication attempts are logged for security monitoring

## ⚠️ If You Still Get Errors

If you continue getting the "Signups not allowed" error after enabling email signups:

1. **Check your Supabase project tier** - Some features may be limited on free tier
2. **Verify the email addresses** are exactly: `dan@secureprivacy.ai` and `pal.schakonat@hyperisland.se`
3. **Try creating the users manually** in Supabase Dashboard → Authentication → Users

The key setting is **"Enable email signups"** in your Supabase Auth configuration. This must be enabled for magic link authentication to work.