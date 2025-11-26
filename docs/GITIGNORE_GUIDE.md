# .gitignore Configuration Guide

## What's Being Ignored

Your `.gitignore` is configured to ignore the following:

### Build Artifacts
```gitignore
node_modules
dist
dist-ssr
```

### Generated Blog Content (Created at Build Time)
```gitignore
public/blog/              # English blog HTML
public/da/blog/           # Danish blog HTML
public/sv/blog/           # Swedish blog HTML
public/no/blog/           # Norwegian blog HTML
public/fi/blog/           # Finnish blog HTML
public/de/blog/           # German blog HTML
public/fr/blog/           # French blog HTML
public/es/blog/           # Spanish blog HTML
public/it/blog/           # Italian blog HTML
public/pt/blog/           # Portuguese blog HTML
public/nl/blog/           # Dutch blog HTML
public/sitemap*.xml       # All generated sitemaps

# IMPORTANT: These are explicitly NOT ignored
!public/locales/          # Translation files (MUST be committed)
!public/robots.txt        # SEO crawler instructions
!public/.well-known/      # AI plugin discovery
!public/images/           # Static images
```

### Temporary Files
```gitignore
*.backup
*.bak
*.tmp
*.old
missing-meta-descriptions.json
translations-missing-meta.json
```

### Development Files
```gitignore
scripts/dev-utils/
*.timestamp-*.mjs         # Vite cache files
.vite/
supabase/.temp/
```

### Documentation
```gitignore
docs/archive/             # Archived/obsolete documentation
```

### System Files
```gitignore
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
desktop.ini

# Editor
*.swp
*.swo
*~
```

## What Should Be Committed

### Static Assets (MUST Be Committed)
- `public/locales/` - **CRITICAL**: All translation files (i18n)
- `public/robots.txt` - SEO crawler instructions
- `public/.well-known/` - AI plugin discovery
- `public/images/` - Static images and logos
- `public/favicon.ico` - Site favicon
- Any other static assets (CSS, fonts, etc.)

**⚠️ WARNING**: Never ignore the entire `/public` directory! This will delete all translation files and break the application.

### Source Code
- All `src/` files
- All `scripts/` files (except dev-utils)
- Configuration files (vite.config.ts, tsconfig.json, etc.)

### Documentation
- `README.md` - Main documentation
- `docs/` - Important documentation (except archive/)
- `CHANGELOG.md` - Version history

### Database
- `supabase/migrations/` - All migration files
- `supabase/functions/` - Edge function code
- `supabase/templates/` - Email templates

## Why This Configuration?

1. **Blog HTML is generated** during build from database content, so no need to commit 200+ HTML files
2. **Sitemaps are generated** dynamically based on content
3. **Language-specific blog directories** are created at build time
4. **Vite cache files** are development artifacts that shouldn't be in git
5. **Archived docs** are kept locally but not committed to reduce repo size

## Build Process

When you run `npm run build`:
1. Blog HTML is generated from database → `public/blog/` and `public/{lang}/blog/`
2. Sitemaps are created → `public/sitemap*.xml`
3. Vite builds the React app → `dist/`
4. Static files from `public/` are copied to `dist/`

## Repository Size

After cleanup:
- **Files**: 166 (down from 392)
- **Size**: 1.8MB (down from 15MB)
- **Git-tracked files**: ~165 (excluding 200+ generated HTML files)

This ensures your repository stays lightweight and works with bolt.new's import limits.
