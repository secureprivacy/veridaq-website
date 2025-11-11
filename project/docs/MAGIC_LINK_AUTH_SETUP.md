# Magic Link Authentication Setup Guide

## Overview

This document outlines the secure magic link authentication system implemented for the Veridaq CMS. The system provides enterprise-grade security with email whitelisting, rate limiting, and comprehensive audit logging.

## Security Features

### 🔐 Email Whitelist
- Only authorized email addresses can access the CMS
- Currently authorized: `dan@secureprivacy.ai` and `pal.schakonat@hyperisland.se`
- Server-side validation prevents unauthorized access attempts

### ⏱️ Rate Limiting
- Maximum 3 magic link requests per hour per email address
- Automatic blocking for 1 hour after exceeding limits
- Prevents brute force and spam attacks

### 📝 Audit Logging
- All authentication attempts are logged with timestamps
- Tracks successful and failed login attempts
- Monitors IP addresses and user agents (when available)
- Provides security audit trail

### 🔒 Session Security
- Magic links expire after 15 minutes
- Automatic session refresh with token rotation
- Secure session validation on each request
- Automatic logout for unauthorized users

## Implementation Details

### Database Schema

The system uses three main tables:

1. **`auth_whitelist`** - Stores authorized email addresses
2. **`auth_attempts`** - Logs all authentication attempts
3. **`auth_rate_limits`** - Tracks rate limiting per email

### Key Functions

- `is_email_whitelisted(email)` - Checks if email is authorized
- `check_rate_limit(email)` - Validates rate limits
- `validate_magic_link_request(email)` - Complete validation pipeline
- `log_auth_attempt(...)` - Security audit logging

## Setup Instructions

### 1. Database Setup
Run the migration file `supabase/migrations/setup_magic_link_auth.sql` in your Supabase SQL Editor.

### 2. Create Authorized User Accounts

**IMPORTANT**: Since signups are disabled for security, you must manually create user accounts for authorized emails:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** or **"Invite user"**
4. Create accounts for these authorized emails:
   - `dan@secureprivacy.ai`
   - `pal.schakonat@hyperisland.se`
5. Set temporary passwords (users will use magic links, not passwords)
6. Ensure **"Email confirmed"** is checked

**Without these user accounts, magic link authentication will fail with "Signups not allowed for otp" error.**

### 3. Supabase Configuration

### Supabase Auth Settings

```toml
[auth]
enable_signup = false
enable_email_confirmations = false
mailer_otp_exp = 900  # 15 minutes
rate_limit_email_sent = 60  # 1 per minute
```

### Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Usage

### Client-Side Authentication

```typescript
import { requestMagicLink, verifySession } from '../lib/auth';

// Request magic link
const result = await requestMagicLink({ 
  email: 'dan@secureprivacy.ai',
  redirectTo: 'https://veridaq.com/#cms/dashboard'
});

// Verify session
const sessionResult = await verifySession();
```

### React Component Integration

```tsx
import AuthGuard from './components/auth/AuthGuard';

// Protect CMS routes
<AuthGuard requireAuth={true}>
  <AdminDashboard />
</AuthGuard>
```

## Security Best Practices Implemented

### ✅ Input Validation
- Email format validation on client and server
- SQL injection prevention through parameterized queries
- XSS protection through proper escaping

### ✅ Rate Limiting
- Prevents brute force attacks
- Configurable limits and timeouts
- Automatic blocking mechanisms

### ✅ Audit Trail
- Complete logging of authentication events
- Timestamp tracking for forensic analysis
- IP address and user agent logging

### ✅ Session Management
- Secure token handling
- Automatic session refresh
- Proper logout procedures

### ✅ Error Handling
- Graceful error messages
- No sensitive information leakage
- Proper error logging

## Monitoring and Maintenance

### Authentication Statistics

The system provides real-time statistics:
- Total authentication attempts (24h)
- Successful vs failed attempts
- Currently blocked email addresses
- Rate limit status

### Log Analysis

Query authentication logs:

```sql
-- Recent authentication attempts
SELECT email, attempt_type, success, created_at, error_message
FROM auth_attempts 
WHERE created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

-- Failed attempts by email
SELECT email, COUNT(*) as failed_attempts
FROM auth_attempts 
WHERE success = false 
  AND created_at > now() - interval '24 hours'
GROUP BY email
ORDER BY failed_attempts DESC;

-- Currently blocked emails
SELECT email, blocked_until, attempt_count
FROM auth_rate_limits 
WHERE is_blocked = true 
  AND blocked_until > now();
```

## Adding New Authorized Users

To add a new authorized email address:

```sql
INSERT INTO auth_whitelist (email, role, notes) 
VALUES ('new.user@company.com', 'admin', 'Description of user');
```

Update the client-side whitelist in `src/lib/auth.ts`:

```typescript
const AUTHORIZED_EMAILS = [
  'dan@secureprivacy.ai',
  'pal.schakonat@hyperisland.se',
  'new.user@company.com'  // Add new email here
];
```

## Troubleshooting

### Common Issues

1. **Magic link not received**
   - Check spam/junk folder
   - Verify email address is in whitelist
   - Check rate limiting status

2. **"Email not authorized" error**
   - Verify email is exactly as configured in whitelist
   - Check for typos in email address
   - Ensure email is active in database

3. **Rate limit exceeded**
   - Wait for the blocking period to expire (1 hour)
   - Contact administrator to reset limits if needed

### Reset Rate Limits

```sql
-- Reset rate limits for specific email
DELETE FROM auth_rate_limits WHERE email = 'user@example.com';

-- Reset all rate limits (emergency use only)
DELETE FROM auth_rate_limits WHERE is_blocked = true;
```

## Production Deployment Checklist

- [ ] Configure Supabase Auth settings
- [ ] Set up custom email templates
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and alerting
- [ ] Test magic link flow end-to-end
- [ ] Verify rate limiting works correctly
- [ ] Test unauthorized access attempts
- [ ] Set up log rotation and archival
- [ ] Configure backup procedures
- [ ] Document incident response procedures

## Support

For technical support or to request access modifications, contact:
- **Primary Admin**: dan@secureprivacy.ai
- **Secondary Admin**: pal.schakonat@hyperisland.se

---

**Security Notice**: This authentication system is designed for production use with sensitive data. All access attempts are monitored and logged. Unauthorized access attempts will be reported to system administrators.