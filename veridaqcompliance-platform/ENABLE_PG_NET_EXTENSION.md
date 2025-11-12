# Enable pg_net Extension - Fix for "schema net does not exist" Error

The error `schema "net" does not exist` occurs because your Supabase project doesn't have the `pg_net` extension enabled, which provides network functions used by database policies.

## 🔧 How to Fix:

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com
2. Navigate to your project
3. Click on **"Database"** in the left sidebar

### Step 2: Enable pg_net Extension  
1. Click on **"Extensions"** (under Database section)
2. Search for **"pg_net"** in the search box
3. Find the **pg_net** extension in the list
4. Click the **toggle button** to enable it
5. Wait for it to show as "Enabled"

### Step 3: Verify the Fix
1. Go back to your CMS at `https://localhost:5173/#cms/blog`
2. The "schema net does not exist" error should be resolved
3. You should be able to view and manage blog posts

## What pg_net Does:
- Provides network functions for HTTP requests
- Required by some database triggers and policies
- Enables advanced Supabase functionality

## ✅ After Enabling:
- Blog post loading will work
- CMS functionality will be restored
- Database errors will be eliminated

**This is a one-time setup - enable the extension and the error will be permanently resolved.**