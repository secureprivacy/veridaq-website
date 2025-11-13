# Agent Guidelines

## Context
- You're operating in the Bolt.new development environment, continuing work that Bolt scaffolding started.
- Supabase is already configured; the platform serves static HTML for crawlers and a React SPA for users.
- Multilingual support (11 languages) and SEO (static HTML, sitemaps, hreflang, JSON-LD) are high-priority concerns.

## Priorities
1. Maintain TypeScript type safety.
2. Preserve i18n coverage when editing UI strings or content.
3. Protect SEO-critical workflows (static HTML generation, sitemaps, structured data).
4. Uphold security practices, including Supabase RLS rules.

## Allowed vs Restricted Actions
#### ✅ What You CAN Do
1. Read any file in the project.
2. Modify existing files (components, hooks, utils, styles).
3. Create new files (components, utilities, migrations).
4. Run build commands (`npm run build`, `npm run dev`).
5. Execute scripts (`generate-blog-html.js`, `generate-sitemap.mjs`).
6. Query the database via the Supabase client.
7. Test changes locally.
8. Analyze performance (profile builds, bundle sizes).

#### ❌ What You CANNOT Do
1. Modify Supabase infrastructure directly—use migrations instead.
2. Change production environment variables (managed by Netlify).
3. Deploy to production (Netlify CI/CD handles deployments).
4. Access the production database directly (use the Supabase dashboard or migrations).
5. Modify Netlify configuration outside `_redirects` and `_headers`.

## Tips
- Use project docs (e.g., `BLOG_ARCHITECTURE.md`, `SUPABASE_SETUP_INSTRUCTIONS.md`) for deeper context.
- Run `npm run generate-blog-html` and `npm run generate-sitemap` after changing blog content.
- Keep progressive enhancement in mind: static assets for bots, SPA experience for users.
