# Blog Refresh Loop Fix - Implementation Summary

## Problem Identified (Legacy Architecture)

The original progressive-enhancement approach attempted to serve static HTML to crawlers and redirect real browsers into the React SPA. Explicit blog rules in `_redirects` delivered the static file for `/fr/blog/`, after which inline JavaScript redirected to `/fr/blog/` again. Because Netlify reapplied the same rule, browsers saw an infinite refresh loop.

## Why It No Longer Happens

The blog now runs in a **universal static mode**:

1. `_redirects` enumerates every blog path (`/blog`, `/fr/blog`, `/fr/blog/*`, etc.) and always serves the generated `index.html`.
2. There is **no browser-only redirect script** inside the static HTML.
3. The SPA catch-all (`/* /index.html 200`) only applies to non-blog routes.

As a result, the loop condition simply cannot occur—every request resolves to a single static document.

## Operational Guidance

* Keep the static-first routing rules intact and ordered above the SPA fallback.
* After editing content, run:
  ```bash
  npm run generate-blog-html
  npm run generate-sitemap
  ```
* Deploy the updated static files so the CDN serves the refreshed HTML.

## Historical Context

The previous fix removed a handful of listing rewrites to allow the JavaScript redirect to fall through to the SPA. That workaround is obsolete. The architecture change eliminated the redirect entirely, replacing it with unconditional static delivery for listings and posts. Documenting the legacy issue here prevents the old workaround from being reintroduced.
