# Blog Architecture – Static-First Delivery

The Veridaq blog now delivers a **single static experience** for every visitor and crawler. Each listing page and individual post is pre-rendered as HTML during the build, stored inside `public/`, and served directly by Netlify without any user-agent detection or client-side redirects. The React SPA remains available for application routes, but the blog itself operates entirely from static files and the SPA is explicitly bypassed for `/blog` URLs.

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
Visitor requests /de/blog/some-slug → CDN serves /de/blog/some-slug/index.html
```

* Every request — human or crawler — resolves to the same static HTML.
* Listings link directly to static posts using relative URLs, so navigation remains static.
* The only dynamic routing that occurs is the global SPA catch-all for non-blog pages, and the SPA ignores `/blog` paths entirely.

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

The redirect configuration is intentionally minimal. Blog paths are enumerated so Netlify always returns the generated `index.html` before falling back to the SPA:

```nginx
# Blog routes – unconditional rewrites
/blog                /blog/index.html            200
/blog/*              /blog/:splat/index.html     200
/fr/blog             /fr/blog/index.html         200
/fr/blog/*           /fr/blog/:splat/index.html  200
... (repeat for da, sv, no, fi, de, es, it, pt, nl)
/*                   /index.html                 200   # SPA fallback
```

Key points:

1. No user-agent conditions are required; crawlers and browsers see identical HTML.
2. The SPA fallback lives at the bottom of the file and only applies to non-blog URLs.
3. Each language pair follows the same pattern, guaranteeing predictable behavior.
4. The SPA router is further protected inside `src/App.tsx`, which refuses to render blog content unless the user explicitly lands on a hash-based route such as `/#blog`.

Because listings and posts are pure HTML, there is nothing to “hydrate.” Navigation relies on `<a>` links between static pages, so users stay inside the static experience until they leave the blog section.

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
| Edit content | Use Supabase CMS | Update translations where applicable. |
| Rebuild static HTML | `npm run generate-blog-html` | Must run before each deploy to keep listings/posts in sync. |
| Refresh sitemaps | `npm run generate-sitemap` | Keeps sitemap index aligned with regenerated files. |
| Verify output locally | Open files under `public/{lang}/blog/` | Ensure metadata, links, and translations look correct. |
| Commit artifacts | Commit generated HTML & CSS if changes are meaningful | Static HTML is source of truth for blog delivery. |
| Verify SPA bypass | Load `/blog/` and `/{lang}/blog/` directly | Pages should render from static HTML without mounting React unless you intentionally visit `/#blog`. |

---

## 7. Testing & Monitoring

* **Spot-check HTML** by curling any URL (no special user-agent needed):
  ```bash
  curl https://veridaq.com/fr/blog/
  curl https://veridaq.com/fr/blog/meilleurs-logiciels-de-diligence-raisonnable-vasp-pour-2025/
  ```
* **Verify redirects** by confirming `/public/_redirects` lists your locale’s blog rules above the SPA fallback.
* **Audit structured data** using Google’s Rich Results Test on any generated HTML file.
* **Monitor Search Console** for indexing coverage and sitemap ingestion.

---

## 8. Key Takeaways

1. The blog is **static-first**: what you see in `public/` is exactly what Netlify serves.
2. Listings and posts are cross-linked entirely with static anchors, so navigation never falls back to the SPA.
3. `_redirects` is simple: explicit blog rewrites plus a single catch-all for the app.
4. Keeping static files fresh is a build responsibility — run the generator after every CMS edit.
5. Crawlers, browsers, and AI agents all consume the same markup, guaranteeing consistent SEO outcomes.
