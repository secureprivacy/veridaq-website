# Blog Architecture – Pure Static HTML

The Veridaq blog delivers a **pure static HTML experience** for every visitor and crawler. Each listing page and individual post is pre-rendered as HTML during the build, stored inside `public/`, and served directly by Netlify. The React SPA **never loads** for blog routes - visitors receive only static HTML/CSS files with zero JavaScript execution. The SPA remains available for application routes (homepage, CMS, etc.), but blog paths are completely isolated from the SPA.

---

## 1. End-to-End Flow

```
Editor updates post in Supabase CMS
        │
        ▼
npm run generate-blog-html
  (builds listings + posts for 11 locales)
        │
        ▼
Static HTML written to public/{lang}/blog/**/*/index.html
        │
        ▼
Netlify deploy picks up new HTML files
        │
        ▼
Visitor requests /de/blog/some-slug → Netlify serves static HTML (200!)
        │
        ▼
Pure HTML page loads - NO React, NO JavaScript hydration
```

**Key Architecture Points:**

* Every request — human or crawler — resolves to the same static HTML.
* Netlify's `200!` status code forces early termination, preventing SPA catch-all.
* Blog pages contain zero React components - just HTML, CSS, and structured data.
* Listings link directly to static posts using `<a>` tags.
* Navigation between blog pages is pure HTML - no client-side routing.
* The SPA only loads for non-blog application routes (homepage, CMS, legal pages).

---

## 2. Directory Layout & Generation Commands

| Location | Contents |
| --- | --- |
| `public/blog/index.html` | English listing page |
| `public/{lang}/blog/index.html` | Listing per supported locale (`da`, `sv`, `no`, `fi`, `de`, `fr`, `es`, `it`, `pt`, `nl`) |
| `public/blog/{slug}/index.html` | English post detail pages |
| `public/{lang}/blog/{slug}/index.html` | Localized post detail pages |
| `public/blog-static.css` | Shared styling for listings and posts |

Regenerate the output whenever content changes:

```bash
npm run generate-blog-html
npm run generate-sitemap
```

The first command rebuilds all listing and post permutations, while the sitemap command refreshes XML indexes so crawlers discover the new files immediately.

---

## 3. Request Handling & `_redirects`

The redirect configuration uses Netlify's `200!` status to force early termination and prevent SPA loading:

```nginx
# Blog routes – pure static HTML with forced termination
/blog                /blog/index.html            200!
/blog/               /blog/index.html            200!
/blog/*              /blog/:splat/index.html     200!
/blog/*/             /blog/:splat/index.html     200!
/fr/blog             /fr/blog/index.html         200!
/fr/blog/            /fr/blog/index.html         200!
/fr/blog/*           /fr/blog/:splat/index.html  200!
/fr/blog/*/          /fr/blog/:splat/index.html  200!
... (repeat for da, sv, no, fi, de, es, it, pt, nl)
/*                   /index.html                 200   # SPA fallback (only for non-blog)
```

**Critical Implementation Details:**

1. **The `200!` status** is essential - it tells Netlify to stop processing rules immediately.
2. Without the `!`, Netlify would continue to the catch-all `/*` rule and load the SPA.
3. Both `/blog` and `/blog/` are handled (with and without trailing slash).
4. No user-agent conditions needed - all visitors get the same static HTML.
5. The SPA catch-all at the bottom **never triggers** for blog routes.

**Additional SPA Safeguards:**

In `src/App.tsx`, if any blog route accidentally reaches the SPA:
- Hash-based `/#blog` routes redirect to static `/blog/`
- The SPA will never render blog components (they've been removed)
- Any attempt to access blog content through React redirects to static HTML

Because listings and posts are pure HTML with no JavaScript, there is:
- No hydration required
- No React rendering
- No client-side routing
- Zero JavaScript execution (except structured data JSON-LD)

Navigation uses standard `<a>` tags, so users stay in pure HTML until they leave the blog section.

---

## 4. Listing Page Behavior

The generator produces rich listing pages for every locale:

* **Card grid** with hero banner, breadcrumb trail, metadata chips, and CTA copy.
* **Localized copy** for breadcrumbs, hero text, and “reading in” label.
* **Internal links** for every post card (`<a href="/{lang}/blog/{slug}/">`).
* **Structured data** using `ItemList` JSON-LD plus organization schema.
* **Hreflang tags** enumerating every available language variant.
* **Zero script tags** beyond structured data — content is immediately readable.

Listings therefore behave like a static directory index: choose a card, click the link, land on another pre-rendered HTML document.

---

## 5. Post Page Behavior

Each post page includes everything needed for SEO and cross-navigation without any runtime JavaScript:

* **Breadcrumb navigation** (`Home → Blog → Article`) plus a persistent “← Back to all articles” link that points at the static listing.
* **Localized metadata** for publish date, reading time, and excerpt.
* **Structured data** covering `BreadcrumbList`, `Article`, `Organization`, and `DataFeed` schemas.
* **Related article grid** that is computed at build time using shared keywords.
* **Share links** that render as plain anchor elements (LinkedIn, X/Twitter, etc.).
* **Footer CTA** and final “back to listing” link to keep navigation static.
* **Hreflang tags** generated from the translation map, ensuring every locale references its counterparts.

Because the HTML already contains the article body, crawlers and accessibility tools receive the full content immediately. No hydration or redirect steps are necessary.

---

## 6. Operational Checklist

| Task | Command / Action | Notes |
| --- | --- | --- |
| Edit content | Use Supabase CMS at `/#cms/blog` | Update translations where applicable. |
| Rebuild static HTML | `npm run generate-blog-html` | Must run before each deploy to keep listings/posts in sync. |
| Refresh sitemaps | `npm run generate-sitemap` | Keeps sitemap index aligned with regenerated files. |
| Verify output locally | Open files under `public/{lang}/blog/` | Ensure metadata, links, and translations look correct. |
| Commit artifacts | Commit generated HTML & CSS | Static HTML is source of truth for blog delivery. |
| Verify static-only delivery | Load `/blog/` and `/{lang}/blog/` directly | Pages should be pure HTML with NO React loaded. Check DevTools Network tab - should only see HTML/CSS requests, no JS bundles. |
| Test navigation | Click between blog posts | Navigation should use browser's native page loads (full page refresh), not client-side routing. |

---

## 7. Testing & Monitoring

**Local Testing:**
```bash
# Test that blog HTML exists and is complete
cat public/blog/index.html | grep -i "veridaq"
cat public/fr/blog/index.html | grep -i "conformité"

# Verify no React bundles are referenced in blog HTML
grep -i "script" public/blog/index.html
# Should ONLY show JSON-LD structured data, NO .js bundles
```

**Production Testing:**
```bash
# Verify static HTML delivery (should return HTML, not redirect)
curl -I https://veridaq.com/blog/
# Should show: HTTP/2 200

# Check HTML content
curl https://veridaq.com/fr/blog/ | grep -i "blog"

# Verify no React is loaded
curl https://veridaq.com/blog/ | grep -c "<script"
# Should be 1-2 (only JSON-LD, no React bundles)
```

**Browser DevTools Testing:**
1. Open `/blog/` in browser with DevTools Network tab open
2. Verify requests:
   - ✅ HTML file (blog/index.html)
   - ✅ CSS file (blog-static.css)
   - ❌ NO .js bundles (no React, no Vite chunks)
   - ❌ NO websocket connections (no HMR)
3. Click a blog post link - should trigger full page reload (not client-side navigation)
4. Browser's back button should work without JavaScript

**SEO & Structured Data:**
* **Audit structured data** using Google's Rich Results Test
* **Monitor Search Console** for indexing coverage
* **Verify sitemap** includes all blog URLs
* **Test hreflang** tags point to correct language variants

---

## 8. Key Takeaways

1. **Pure Static HTML**: The blog uses ZERO React code. What you see in `public/` is exactly what visitors receive.

2. **200! Status is Critical**: The `!` in Netlify's redirect rules forces early termination, preventing the SPA catch-all from triggering.

3. **No JavaScript Execution**: Blog pages load only HTML and CSS. The only `<script>` tags are JSON-LD structured data.

4. **Standard Navigation**: Blog links use `<a>` tags, causing full page reloads. Browser back/forward buttons work natively.

5. **SPA is Isolated**: The React application never mounts for blog routes. Blog components have been removed from the codebase.

6. **Build-Time Generation**: Run `npm run generate-blog-html` after every CMS edit to regenerate static files.

7. **Universal Delivery**: Crawlers, browsers, and AI agents all receive identical markup, guaranteeing consistent SEO.

8. **Performance Benefits**: Zero JavaScript means instant page loads, no hydration delays, and optimal Core Web Vitals.

## 9. Troubleshooting

**Problem: /blog loads the homepage instead of the blog**
- **Cause**: Missing `!` in `_redirects` file, allowing SPA catch-all to trigger
- **Solution**: Ensure all blog routes use `200!` status (with the exclamation mark)

**Problem: React bundles are loading on blog pages**
- **Cause**: SPA is still mounting due to incorrect redirect configuration
- **Solution**: Check DevTools Network tab, verify `200!` status in `_redirects`, clear CDN cache

**Problem: Navigation doesn't work between blog posts**
- **Cause**: Generated HTML links might be incorrect
- **Solution**: Verify `npm run generate-blog-html` completed successfully, check link hrefs in HTML

**Problem: Blog styling looks broken**
- **Cause**: CSS file not found or path incorrect
- **Solution**: Ensure `/blog-static.css` exists in `public/`, check `<link>` tag in generated HTML
