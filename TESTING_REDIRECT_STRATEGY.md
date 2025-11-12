# Testing the New Redirect Strategy

## Quick Testing Guide

### 1. Test Crawler Gets Static HTML

```bash
# Test with Googlebot
curl -sI -A "Googlebot/2.1" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025

# Expected headers:
# HTTP/2 200
# content-type: text/html
# Should NOT be a redirect

# Get full content
curl -s -A "Googlebot/2.1" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025 | grep -i "kyc" | head -5

# Should show actual post content
```

### 2. Test Browser Gets React SPA

```bash
# Test with browser user-agent
curl -sI -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025

# Expected: Same 200 but React app
# Content will be minimal - React renders client-side

# Get content
curl -s -A "Mozilla/5.0" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025 | grep -i "root"

# Should show React root element
```

### 3. Test Different Crawler Types

```bash
# Bingbot
curl -sI -A "Mozilla/5.0 (compatible; bingbot/2.0)" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025

# GPTBot (OpenAI)
curl -sI -A "GPTBot/1.0" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025

# Claude-Web (Anthropic)
curl -sI -A "Claude-Web/1.0" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025

# All should return 200 with static HTML
```

### 4. Test Blog Listing Pages

```bash
# English blog listing for crawler
curl -A "Googlebot" https://veridaq.com/blog | grep -i "blog" | head -5

# Should show list of blog posts

# Danish blog listing for crawler
curl -A "Googlebot" https://veridaq.com/da/blog | grep -i "blog" | head -5
```

### 5. Test Social Media Bots

```bash
# Facebook
curl -sI -A "facebookexternalhit/1.1" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025

# Twitter
curl -sI -A "Twitterbot/1.0" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025

# LinkedIn
curl -sI -A "LinkedInBot/1.0" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025

# All should get static HTML with Open Graph tags
```

### 6. Verify Static Files Exist

```bash
# Check English blog post
ls -lh /tmp/cc-agent/59040814/project/dist/blog/best-kyc-and-aml-platforms-for-2025/index.html

# Check Danish translation
ls -lh /tmp/cc-agent/59040814/project/dist/da/blog/best-kyc-and-aml-platforms-for-2025-danish/index.html

# All should exist and be non-empty
```

### 7. Test Multilingual Routes

```bash
# Test German blog for crawler
curl -A "Googlebot" https://veridaq.com/de/blog/best-kyc-and-aml-platforms-for-2025-german

# Test French blog for browser
curl -A "Mozilla/5.0" https://veridaq.com/fr/blog/best-kyc-and-aml-platforms-for-2025-french

# Crawler should get German static HTML
# Browser should get React app
```

## Validation Checklist

After deployment:

- [ ] Crawlers receive static HTML (verify with curl + bot user-agent)
- [ ] Browsers receive React SPA (verify with curl + browser user-agent)
- [ ] No force redirects trigger (verify with curl -I)
- [ ] Static files contain full blog content
- [ ] React app loads correctly in real browsers
- [ ] Client-side navigation works (no page refreshes)
- [ ] All 11 languages route correctly
- [ ] Social media previews work (test with Facebook debugger)
- [ ] Google Search Console can fetch as Googlebot
- [ ] Sitemaps are accessible to all user-agents

## Key Differences to Verify

### Crawler Request Flow
```
1. Request: GET /blog/post-slug
2. User-Agent: Googlebot/2.1
3. Netlify matches "User-Agent=*bot*"
4. Serves: /blog/post-slug/index.html (static)
5. Response: Full HTML with content
```

### Browser Request Flow
```
1. Request: GET /blog/post-slug
2. User-Agent: Mozilla/5.0 (Chrome)
3. Netlify: No user-agent match (default)
4. Serves: /index.html (React app)
5. Response: React app shell
6. Client-side: React Router renders post
```

## Common Issues & Solutions

### Issue: Crawler getting React app instead of static HTML
**Diagnosis**: User-agent pattern not matching
**Solution**: Check user-agent string, add pattern if needed

### Issue: Browser getting static HTML instead of React
**Diagnosis**: User-agent incorrectly matching crawler pattern
**Solution**: Refine user-agent patterns to be more specific

### Issue: 404 for blog posts
**Diagnosis**: Static HTML file doesn't exist
**Solution**: Run `npm run build` to regenerate static files

### Issue: Social media preview not working
**Diagnosis**: Bot not recognized as crawler
**Solution**: Add specific user-agent pattern for that platform

## Monitoring After Deployment

1. **Netlify Analytics**: Watch for any unexpected redirects
2. **Google Search Console**: Check "Coverage" report for indexing
3. **Browser DevTools**: Verify React app loads correctly
4. **Curl Tests**: Regularly test with different user-agents

## Success Metrics

You'll know it's working when:

- ✅ Google Search Console shows 200 status for blog posts
- ✅ "Fetch as Google" returns full HTML content
- ✅ Browser users see smooth SPA navigation
- ✅ Social media shares show rich previews
- ✅ No infinite redirects or loops
- ✅ All languages work correctly
- ✅ Static HTML has proper meta tags and content

## Troubleshooting Commands

```bash
# Check if static file exists
ls -la /tmp/cc-agent/59040814/project/dist/blog/*/index.html

# Verify _redirects is deployed
curl -I https://veridaq.com/_redirects

# Test specific user-agent pattern
curl -A "CustomBot/1.0" -I https://veridaq.com/blog

# View full static HTML
curl -A "Googlebot" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025 > test.html
open test.html  # macOS
xdg-open test.html  # Linux

# Check Netlify headers
curl -I https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025 | grep -i netlify
```

## Summary

The new redirect strategy eliminates force redirects and uses explicit user-agent-based routing:

- **138 user-agent rules** for crawlers across all languages
- **0 force redirects** (all `!` flags removed)
- **Explicit routing** for crawlers → static HTML
- **Default routing** for browsers → React SPA
- **No fallback pattern** - all routing is intentional

This provides optimal SEO (static HTML for crawlers) while maintaining the best user experience (React SPA for browsers).
