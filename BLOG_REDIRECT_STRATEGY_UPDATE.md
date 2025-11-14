# Blog Redirect Strategy Update

## Summary

The blog now uses **unconditional static rewrites** for every language and slug. This replaces the user-agent detection layer that previously split traffic between crawlers (static HTML) and browsers (React SPA).

## What Changed

### Before
- Hundreds of user-agent rules mapped crawler traffic to `/blog/.../index.html`.
- Browser traffic fell through to `/index.html`, relying on the SPA for rendering.
- Documentation referenced a progressive-enhancement flow with client-side redirects.

### After
- Each blog route (`/blog`, `/blog/*`, `/fr/blog`, `/fr/blog/*`, etc.) resolves directly to its static `index.html`.
- `_redirects` keeps only one SPA rule: `/* /index.html 200` for non-blog pages.
- Users and crawlers receive identical HTML with no runtime detection.

## Benefits

1. **Deterministic delivery** – every request returns the generated HTML without conditions.
2. **Simpler maintenance** – `_redirects` focuses on enumerating blog paths plus a single catch-all.
3. **Consistent SEO signals** – structured data, hreflang tags, and canonical URLs are always present.
4. **No client redirects** – pages render immediately, improving perceived performance.

## Testing

```bash
curl https://veridaq.com/blog/
curl https://veridaq.com/fr/blog/
curl https://veridaq.com/fr/blog/meilleurs-logiciels-de-diligence-raisonnable-vasp-pour-2025/
```

Each command should return the full static HTML document, regardless of the user-agent header.

## Follow-Up Actions

- Regenerate static HTML with `npm run generate-blog-html` before each deploy.
- Keep the language-specific rewrites grouped at the top of `_redirects` so they run before the SPA fallback.
- Remove any remaining documentation that references user-agent detection for the blog.
