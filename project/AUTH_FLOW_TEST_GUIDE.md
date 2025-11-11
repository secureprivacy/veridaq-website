# Authentication Flow Testing Guide

## Changes Made

### 1. Fixed OTP Code Request Function
**File**: `src/lib/auth.ts`
- Removed `emailRedirectTo: undefined` from the options
- Supabase interprets `emailRedirectTo: undefined` the same as setting a redirect URL
- Now the `emailRedirectTo` field is completely omitted from the request
- Added comprehensive console logging to track the flow

### 2. Added Diagnostic Logging
**Files**: `src/lib/auth.ts` and `src/components/auth/MagicLinkAuth.tsx`
- Added detailed console logs to track which authentication mode is active
- Logs show which function is being called (requestMagicLink vs requestOtpCode)
- Logs display the exact parameters being sent to Supabase
- Clear visual indicators (emojis) make it easy to track the flow in console

## Key Difference Between Auth Modes

### Magic Link Mode
```typescript
supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: 'https://yourdomain.com/auth/callback',
    shouldCreateUser: false
  }
})
```
**Result**: Sends a clickable link in the email

### OTP Code Mode
```typescript
supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: true
    // NO emailRedirectTo field at all
  }
})
```
**Result**: Sends a 6-digit code in the email

## Testing Instructions

### Step 1: Open Browser Console
1. Open your application
2. Press F12 to open Developer Tools
3. Navigate to the Console tab
4. Keep it open during testing

### Step 2: Test OTP Code Flow
1. Click on "Copy-Paste Code" button (should have a Key icon)
2. Enter an authorized email address
3. Click "Send Code to Email"
4. **Check Console Logs** - You should see:
   ```
   🔄 handleSubmit called
   📋 Current auth mode: otp-code
   📧 Email: [your-email]
   🔑 Calling requestOtpCode...
   🔑 requestOtpCode: Starting OTP code request
   📡 Calling Supabase signInWithOtp for OTP CODE (no redirect URL)
   📋 Request params: { email: ..., shouldCreateUser: true, emailRedirectTo: 'NOT SET (will send 6-digit code)' }
   ✅ OTP code request successful
   📬 Check email for 6-digit code
   ```
5. **Check Your Email** - You should receive an email with:
   - Subject: "Your verification code"
   - Body: Contains a 6-digit number (e.g., "123456")
   - NO clickable link

### Step 3: Test Magic Link Flow
1. Click on "Magic Link" button (should have a Mail icon)
2. Enter an authorized email address
3. Click "Send Secure Magic Link"
4. **Check Console Logs** - You should see:
   ```
   🔄 handleSubmit called
   📋 Current auth mode: magic-link
   📧 Email: [your-email]
   🔗 Calling requestMagicLink...
   🔗 requestMagicLink: Starting magic link request process...
   📡 Calling Supabase signInWithOtp for MAGIC LINK (with redirect URL)...
   ✅ Magic link request successful - check your email!
   ```
5. **Check Your Email** - You should receive an email with:
   - Subject: "Confirm Your Signup" or "Magic Link"
   - Body: Contains a clickable link/button
   - NO 6-digit code

## Troubleshooting

### Issue: Still receiving magic links when requesting OTP code

**Check Console Logs**:
- Verify you see "Current auth mode: otp-code"
- Verify you see "Calling requestOtpCode..."
- Verify you see "emailRedirectTo: 'NOT SET (will send 6-digit code)'"

**If the console shows correct mode but email is wrong**:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Check the "Confirm signup" template
3. Make sure it includes the token variable: `{{ .Token }}`

**If console shows wrong mode**:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that the UI buttons are correctly setting state

### Issue: Not receiving any emails

**Check**:
1. Spam/Junk folder
2. Supabase Dashboard → Authentication → Providers → Email
   - Ensure "Enable email provider" is ON
   - Ensure "Confirm email" is OFF (or ON based on your preference)
3. Rate limiting - wait 60 seconds between requests
4. Check auth_attempts table in database for logged errors

### Issue: Emails take too long to arrive

- Supabase free tier has rate limits
- Email delivery can take 1-5 minutes during high load
- Check Supabase Dashboard → Project Settings → API for any issues

## Expected Behavior Summary

| Mode | Button Text | Console Output | Email Content |
|------|-------------|----------------|---------------|
| OTP Code | "Send Code to Email" | `Calling requestOtpCode...` + `OTP CODE (no redirect URL)` | 6-digit number |
| Magic Link | "Send Secure Magic Link" | `Calling requestMagicLink...` + `MAGIC LINK (with redirect URL)` | Clickable link |

## Verification Checklist

- [ ] Console shows correct auth mode when button is clicked
- [ ] Console shows correct function being called
- [ ] Console shows correct Supabase parameters
- [ ] OTP Code mode sends 6-digit code in email
- [ ] Magic Link mode sends clickable link in email
- [ ] Rate limiting works (can't spam requests)
- [ ] Error handling shows clear messages
- [ ] Both auth flows successfully authenticate users
- [ ] Authenticated users can access CMS dashboard

## Next Steps After Testing

1. If OTP codes are working: Remove or reduce console logging for production
2. If magic links are working: Verify redirect URLs match Supabase configuration
3. Monitor auth_attempts table for security insights
4. Consider adjusting rate limits based on usage patterns
