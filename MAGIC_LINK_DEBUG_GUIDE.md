# 🔍 Magic Link Authentication Debug Guide

## Current Issue: "One-time token not found"

The Supabase logs show: `"One-time token not found"` which means the magic link token is invalid when Supabase tries to verify it.

## 🧪 **Step-by-Step Debugging Process**

### Step 1: Check Console Logs
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try magic link authentication again
4. Look for these specific log messages:
   - `🔄 Starting magic link request process...`
   - `🔗 Magic link redirect URL being sent to Supabase:`
   - `📡 Calling Supabase signInWithOtp...`
   - `📥 Supabase response:`

### Step 2: Inspect the Magic Link Email
1. **DO NOT CLICK THE LINK YET**
2. Right-click on the "Access CMS Dashboard" button in the email
3. Select "Copy link address" or "Copy link"
4. Paste the full URL here for analysis

The URL should look like:
```
https://rjncawbywidrtwcprfgw.supabase.co/auth/v1/verify?token=LONG_TOKEN_HERE&type=magiclink&redirect_to=https%3A//veridaq.com/%23cms/dashboard
```

### Step 3: Verify Supabase Configuration

#### A. Check Redirect URLs
1. Supabase Dashboard → Authentication → Settings → URL Configuration
2. **Site URL**: `https://veridaq.com`
3. **Redirect URLs**: Must include `https://veridaq.com/#cms/dashboard`

#### B. Check Auth Settings
1. Supabase Dashboard → Authentication → Settings → Auth
2. **Enable email signups**: ✅ ON
3. **Enable email confirmations**: ❌ OFF
4. **Mailer OTP expiry**: `3600` (1 hour)

### Step 4: Test Different Scenarios

#### Scenario A: Fresh Magic Link
1. Clear browser cache and cookies
2. Go to `https://veridaq.com/#cms`
3. Request new magic link
4. Check email immediately
5. Click link within 1 minute

#### Scenario B: Different Email Provider
1. Try with a Gmail or Outlook.com address (if you have access)
2. This helps rule out corporate email security issues

#### Scenario C: Direct Token Inspection
1. When you get the magic link, look at the URL structure
2. Check if the `redirect_to` parameter is properly URL-encoded
3. Verify the token parameter exists and is not empty

## 🔍 **Common Causes & Solutions**

### Cause 1: URL Encoding Issues
**Problem**: The redirect URL isn't properly encoded
**Solution**: The `#` in `#cms/dashboard` should be encoded as `%23`

### Cause 2: User Account Issues
**Problem**: User exists but isn't properly confirmed
**Solution**: 
1. Supabase Dashboard → Authentication → Users
2. Find your email address
3. Ensure "Email Confirmed" shows "Yes"
4. If "No", click the user and manually confirm

### Cause 3: Multiple Clicks/Pre-scanning
**Problem**: Email security scanned the link before you clicked it
**Solution**: Request a fresh magic link and click immediately

### Cause 4: Supabase Project Issues
**Problem**: Project configuration or temporary issues
**Solution**: 
1. Check Supabase status page
2. Try creating a test user manually in Dashboard
3. Verify project is not paused or suspended

## 🚨 **Emergency Workaround**

If magic links continue failing, you can temporarily enable password authentication:

1. **Supabase Dashboard** → Authentication → Settings → Auth
2. **Enable "Enable email signups"** → ON
3. **Create users manually** with passwords in Dashboard
4. **Modify the auth component** to show password login option

## 📋 **Information Needed for Further Debugging**

Please provide:
1. **The exact magic link URL** from your email (copy link address)
2. **Console log output** from the authentication attempt
3. **Supabase user list screenshot** showing the user accounts
4. **Current Supabase auth settings** (screenshot of the Auth settings page)

This will help pinpoint the exact cause of the "One-time token not found" error.