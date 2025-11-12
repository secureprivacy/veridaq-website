# 🔧 Supabase Magic Link Redirect Configuration

The `otp_expired` error you're experiencing is caused by incorrect redirect URL configuration in your Supabase project. Here's how to fix it:

## 🎯 **Required Supabase Configuration**

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com
2. Navigate to your project
3. Click **"Authentication"** in the left sidebar
4. Click **"Settings"** (gear icon)

### Step 2: Configure Site URLs
In the **"URL Configuration"** section:

1. **Site URL**: Set to `https://veridaq.com`
2. **Additional Site URLs**: Add these if testing locally:
   - `http://localhost:5173`
   - `http://localhost:3000`

### Step 3: Configure Redirect URLs
In the **"Redirect URLs"** section, add these exact URLs:

```
https://veridaq.com/#cms/dashboard
http://localhost:5173/#cms/dashboard
```

**CRITICAL**: The redirect URLs must match EXACTLY what your application sends in the `emailRedirectTo` parameter.

### Step 4: Verify Auth Settings
In **Authentication** → **Settings** → **Auth**:

1. **Enable email signups**: ✅ ON (required for magic links)
2. **Enable email confirmations**: ❌ OFF (for magic links)
3. **Enable email autoconfirm**: ✅ ON (for magic links)
4. **Mailer OTP expiry**: Set to `900` (15 minutes) or `3600` (1 hour)

### Step 5: Check Email Provider
In **Authentication** → **Providers**:
- Ensure **"Email"** provider is ✅ **ENABLED**

## 🧪 **Test After Configuration**

1. Save all settings in Supabase Dashboard
2. Wait 1-2 minutes for settings to propagate
3. Try magic link authentication again at `https://veridaq.com/#cms`
4. Use authorized email: `dan@secureprivacy.ai` or `pal.schakonat@hyperisland.se`

## 🔍 **Common Issues**

### Issue: Still getting `otp_expired`
**Solution**: 
- Double-check that redirect URLs are EXACTLY as shown above
- Ensure no trailing slashes or extra characters
- Verify the Site URL matches your domain exactly

### Issue: Magic link not received
**Solution**:
- Check spam/junk folder
- Verify email provider is enabled
- Check Supabase logs for email delivery issues

### Issue: Link works but redirects to wrong page
**Solution**:
- Verify the `emailRedirectTo` parameter in your code matches the configured redirect URLs
- Check that your application properly handles the authentication callback

## 📧 **Email Template (Optional)**

You can also customize the magic link email template in:
**Authentication** → **Settings** → **Email Templates** → **Magic Link**

## 🚨 **Security Note**

Only add redirect URLs that you control and trust. Never add URLs from domains you don't own, as this could be a security vulnerability.

---

**After completing these steps, the magic link authentication should work correctly and redirect you to the CMS dashboard.**