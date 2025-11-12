# Testing Sitemap Discovery - Quick Reference

## Quick Validation Commands

### 1. Test Build Locally
```bash
npm run build
```
Should complete with:
```
✅ All sitemap validation tests PASSED
```

### 2. Test Production
```bash
npm run test:sitemaps:production
```
Tests live https://veridaq.com URLs

### 3. Validate Individual Files
```bash
npm run validate-sitemaps
```
Tests dist directory artifacts only

## Manual Testing Checklist

### Test Sitemap Discovery Methods

#### Method 1: robots.txt
```bash
curl https://veridaq.com/robots.txt | grep "Sitemap:"
```
✅ Should show: `Sitemap: https://veridaq.com/sitemap.xml`

#### Method 2: HTML <link> Tags
```bash
curl -A "Googlebot" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025 | grep "rel=\"sitemap\""
```
✅ Should show: `<link rel="sitemap" type="application/xml"...>`

#### Method 3: Direct XML Access
```bash
curl -I https://veridaq.com/sitemap.xml | grep "Content-Type"
```
✅ Should show: `Content-Type: application/xml`

#### Method 4: HTTP Link Headers
```bash
curl -I -A "Googlebot" https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025 | grep "Link:"
```
✅ Should show: `Link: <https://veridaq.com/sitemap.xml>; rel="sitemap"`

#### Method 5: AI Plugin Discovery
```bash
curl https://veridaq.com/.well-known/ai-plugin.json | grep "sitemap"
```
✅ Should show sitemap URL in JSON

### Test Sitemap Aliases

```bash
# Should redirect (301)
curl -I https://veridaq.com/sitemap_index.xml
curl -I https://veridaq.com/sitemapindex.xml
curl -I https://veridaq.com/blog/sitemap.xml

# Should return 200 (same as main)
curl -I https://veridaq.com/sitemap.xml.gz
```

### Test 404 Handling

```bash
# Should return 404, not SPA HTML
curl -I https://veridaq.com/_sitemap/fake.xml
curl -I https://veridaq.com/wp-sitemap.xml
```

### Test Trailing Slash Handling

```bash
# Browsers should get React SPA
curl -A "Mozilla/5.0" https://veridaq.com/blog/ | grep "<div id=\"root\""
curl -A "Mozilla/5.0" https://veridaq.com/blog/post-slug/ | grep "<div id=\"root\""

# Crawlers should get static HTML
curl -A "Googlebot" https://veridaq.com/blog/ | grep "<article"
```

### Test Multilingual Support

```bash
# Danish blog
curl -A "Googlebot" https://veridaq.com/da/blog/bedste-kyc-og-aml-platforme | grep "rel=\"sitemap\""

# German blog
curl -A "Googlebot" https://veridaq.com/de/blog/ | grep "rel=\"sitemap\""
```

## Expected Results Summary

| Endpoint | Expected Status | Expected Content-Type | Notes |
|----------|----------------|----------------------|-------|
| `/sitemap.xml` | 200 | application/xml | Main sitemap index |
| `/sitemap-core.xml` | 200 | application/xml | Core pages |
| `/sitemap-blog-en.xml` | 200 | application/xml | English blog posts |
| `/sitemap_index.xml` | 301 → `/sitemap.xml` | - | Alias redirect |
| `/blog/sitemap.xml` | 301 → `/sitemap.xml` | - | Alias redirect |
| `/.well-known/ai-plugin.json` | 200 | application/json | AI plugin |
| `/ai-plugin.json` | 200 | application/json | AI plugin alias |
| `/_sitemap/fake.xml` | 404 | - | Invalid path |

## Common Issues & Solutions

### Issue: Sitemap returns HTML instead of XML
```bash
# Check Content-Type header
curl -I https://veridaq.com/sitemap.xml

# Expected: Content-Type: application/xml
# If you see text/html, check:
# 1. _headers file deployed correctly
# 2. No force redirect overriding static file
# 3. File exists in dist/
```

### Issue: Alias URLs don't redirect
```bash
# Test redirect
curl -I https://veridaq.com/sitemap_index.xml

# Expected: HTTP 301 with Location header
# If you see 200, check:
# 1. _redirects file deployed correctly
# 2. Rules are in correct order (before catch-all)
```

### Issue: HTML missing sitemap tags
```bash
# Check static HTML
curl -A "Googlebot" https://veridaq.com/blog/post-slug | grep sitemap

# Expected: <link rel="sitemap" tag
# If missing:
# 1. Rebuild with latest generate-blog-html.js
# 2. Check script ran during build
```

### Issue: Browsers seeing static HTML
```bash
# Test browser user-agent
curl -A "Mozilla/5.0" https://veridaq.com/blog/ | head -20

# Expected: React app (<div id="root">)
# If seeing <article> tags (static HTML):
# 1. Check trailing slash rules in _redirects
# 2. Verify browser rules come after crawler rules
```

## Validation Script Output

### Success Example
```
🔍 Starting Sitemap Validation

Testing local build artifacts...

ℹ️  Validating sitemap files in dist directory...
✅ Valid file: /sitemap.xml (2.74 KB)
✅ Valid file: /sitemap-core.xml (38.80 KB)
...

============================================================
Tests run: 30
Passed: 30

✅ All sitemap validation tests PASSED
```

### Failure Example
```
🔍 Starting Sitemap Validation

Testing local build artifacts...

ℹ️  Validating sitemap files in dist directory...
❌ File contains HTML instead of XML: /sitemap.xml
❌ Missing XML declaration in /sitemap-core.xml

============================================================
Tests run: 30
Passed: 28
Failed: 2

❌ Sitemap validation FAILED
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Build and validate
  run: npm run build
  # Build fails if validation fails

- name: Test production after deploy
  run: npm run test:sitemaps:production
  # Optional: test live URLs
```

### Pre-deployment Checklist
- [ ] `npm run build` completes successfully
- [ ] All 30 validation tests pass
- [ ] Static HTML files contain sitemap tags
- [ ] AI plugin JSON is in dist/.well-known/
- [ ] _redirects has 352 rules
- [ ] _headers includes Link header rules

### Post-deployment Validation
```bash
# Wait 5 minutes for CDN propagation
sleep 300

# Test production
npm run test:sitemaps:production

# Manual spot checks
curl -I https://veridaq.com/sitemap.xml
curl -A "Googlebot" https://veridaq.com/blog/ | grep sitemap
curl https://veridaq.com/.well-known/ai-plugin.json
```

## Monitoring in Production

### Google Search Console
1. Go to Sitemaps section
2. Verify sitemap is processed
3. Check coverage for indexed pages
4. Use URL Inspection Tool on blog posts

### Netlify Analytics
1. Check redirect counts for alias URLs
2. Monitor 404 rates
3. Verify proper Content-Type distribution

### Manual Periodic Checks
```bash
# Weekly validation
npm run test:sitemaps:production

# Check specific crawlers
curl -A "Googlebot/2.1" https://veridaq.com/blog/
curl -A "GPTBot/1.0" https://veridaq.com/blog/
curl -A "Claude-Web/1.0" https://veridaq.com/blog/
```

## Success Metrics

You'll know everything is working when:

1. ✅ Google Search Console shows sitemap fully processed
2. ✅ "Fetch as Google" returns static HTML with sitemap tags
3. ✅ All alias URLs redirect correctly (no 404s in logs)
4. ✅ Browsers never see static HTML (always React SPA)
5. ✅ HTTP headers include Link to sitemap
6. ✅ AI plugin JSON accessible and valid
7. ✅ Automated tests pass on every build

## Troubleshooting Resources

- **Build failures**: Check `npm run build` output
- **Production issues**: Run `npm run test:sitemaps:production`
- **Missing tags**: Rebuild and check generate-blog-html.js
- **Wrong content**: Verify _redirects and _headers deployed
- **Crawler problems**: Check user-agent matching in _redirects

## Quick Links

- Main sitemap: https://veridaq.com/sitemap.xml
- Robots.txt: https://veridaq.com/robots.txt
- AI plugin: https://veridaq.com/.well-known/ai-plugin.json
- Sample blog post: https://veridaq.com/blog/best-kyc-and-aml-platforms-for-2025
- Blog listing: https://veridaq.com/blog/
