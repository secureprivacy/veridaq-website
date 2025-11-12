# Supabase User Setup for Magic Link Authentication

## 🚨 CRITICAL: Manual User Creation Required

**IMPORTANT**: The "Database error saving new user" error occurs because user accounts don't exist in Supabase. You MUST manually create these accounts before magic link authentication will work.

## Step-by-Step Instructions

### 1. Access Supabase Dashboard
1. Go to https://supabase.com
2. Navigate to your project
3. Click **"Authentication"** in the left sidebar
4. Click **"Users"** tab

### 2. Create Authorized Users

For each authorized email address, follow these steps:

#### For `dan@secureprivacy.ai`:
1. Click **"Add user"** or **"Invite user"**
2. **Email**: `dan@secureprivacy.ai`
3. **Password**: Use any temporary password (e.g., `TempPass123!`) - it won't be used for login
4. **Auto Confirm User**: ✅ Check this box
5. **Email Confirmed**: ✅ Check this box
6. Click **"Create user"**

#### For `pal.schakonat@hyperisland.se`:
1. Click **"Add user"** or **"Invite user"**
2. **Email**: `pal.schakonat@hyperisland.se`
3. **Password**: Use any temporary password (e.g., `TempPass123!`) - it won't be used for login
4. **Auto Confirm User**: ✅ Check this box
5. **Email Confirmed**: ✅ Check this box
6. Click **"Create user"**

## 🔧 Alternative: Enable Signups Temporarily

If manual user creation fails, you can temporarily enable signups:

1. **Go to Supabase Dashboard** → Authentication → Settings
2. **Enable "Enable email signups"** temporarily
3. **Test magic link authentication** - it will create the users automatically
4. **Disable "Enable email signups"** again for security
5. **Verify both users exist** in the Users tab

### 3. Verify User Creation

After creating both users, you should see them in the Users list with:
- ✅ **Email Confirmed**: Yes
- 🔐 **Provider**: email
- 📅 **Created**: Recent timestamp

## 🔐 How Magic Link Authentication Works

1. **User visits `#cms`** → Shows magic link form
2. **User enters authorized email** → System validates against whitelist
3. **System sends magic link** → Supabase sends secure email
4. **User clicks link** → Authenticated and redirected to CMS
5. **Session established** → User can access CMS features

## ⚠️ Important Notes

- **No passwords needed**: Users authenticate via email links only
- **15-minute expiration**: Magic links expire for security
- **Rate limited**: Maximum 3 requests per hour per email
- **Audit logged**: All attempts are tracked for security

## 🧪 Testing the Setup

After creating the users:

1. Visit `https://veridaq.com/#cms`
2. Enter `dan@secureprivacy.ai` or `pal.schakonat@hyperisland.se`
3. Click "Send Secure Magic Link"
4. Check email for the magic link
5. Click the link to access the CMS

## 🚨 Troubleshooting

### "Database error creating new user"
- This means the user doesn't exist in Supabase Auth
- Follow the manual user creation steps above

### "Signups not allowed for otp"
- This is the expected behavior for security
- Users must be pre-created by administrators

### Magic link not received
- Check spam/junk folder
- Verify email address is exactly as configured
- Wait 1 minute between requests (rate limited)

### Still getting errors?
- Verify both users are created in Supabase Dashboard
- Check that "Email Confirmed" is ✅ for both users
- Ensure the email addresses match exactly (case-sensitive)

---

**Security Note**: This setup ensures only pre-authorized users can access the CMS, providing enterprise-grade security for your content management system.