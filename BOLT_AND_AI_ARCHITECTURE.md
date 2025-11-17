# Veridaq Project Architecture & AI Development Guide

**For OpenAI Codex and Claude Code**

This document explains the complete architecture of the Veridaq project, how it was scaffolded in Bolt.new, and how to work with it effectively using external AI coding assistants like OpenAI Codex or Claude Code.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Bolt.new Environment](#boltnew-environment)
3. [Technical Architecture](#technical-architecture)
4. [Working with AI Assistants](#working-with-ai-assistants)
5. [Key Systems & Features](#key-systems--features)
6. [Database Schema](#database-schema)
7. [Development Workflows](#development-workflows)
8. [Build & Deployment](#build--deployment)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Veridaq** is a multilingual SaaS platform providing KYC (Know Your Customer) and AML (Anti-Money Laundering) compliance solutions for financial institutions across the EU.

### Key Characteristics

- **Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, storage)
- **Languages**: 11 supported languages (en, da, sv, no, fi, de, fr, es, it, pt, nl)
- **i18n**: react-i18next with JSON-based translations
- **Deployment**: Netlify with custom redirect rules
- **CMS**: Custom admin dashboard for blog management
- **SEO**: Static-first delivery with pre-rendered HTML for every request

### Project Purpose

The platform serves financial institutions (banks, fintech companies, crypto exchanges) with compliance tools while maintaining a multilingual blog for content marketing and SEO across European markets.

---

## Bolt.new Environment

### What is Bolt.new?

Bolt.new is a rapid prototyping environment that scaffolds full-stack web applications. It provides:

- **Instant scaffolding** - Creates React/Vite projects with zero configuration
- **Integrated Supabase** - Pre-configured database with connection strings
- **Live preview** - Real-time development server
- **Git integration** - Version control built-in
- **Deployment** - One-click deployment to Netlify

### What Bolt.new Did for This Project

1. **Initial Setup** (Completed)
   - Created Vite + React + TypeScript project structure
   - Configured Tailwind CSS for styling
   - Set up ESLint and TypeScript configurations
   - Initialized Supabase project with connection strings
   - Created base component structure

2. **Supabase Integration** (Completed)
   - Provisioned PostgreSQL database
   - Set up authentication system
   - Created storage buckets for blog images
   - Generated API keys and connection strings (see `.env`)

3. **Deployment Configuration** (Completed)
   - Configured Netlify redirect rules (`public/_redirects`)
   - Set up environment variables
   - Created build scripts for static HTML generation
   - Configured CDN and caching headers

### Bolt.new Limitations (Why You Need External AI Tools)

Bolt.new is excellent for scaffolding and rapid prototyping, but has limitations for deep development work:

❌ **Limited deep refactoring** - Cannot easily restructure large codebases
❌ **Complex debugging** - Limited ability to trace multi-file bugs
❌ **Advanced features** - Struggles with complex state management, optimization
❌ **Database management** - Cannot deeply analyze or optimize database queries
❌ **Performance tuning** - Limited profiling and optimization capabilities
❌ **Large-scale changes** - Difficult to coordinate changes across many files

✅ **External AI tools (Codex, Claude Code) excel at:**
- Deep codebase analysis and refactoring
- Complex debugging and error tracing
- Performance optimization
- Database query optimization
- Architectural decisions
- Large-scale code changes
- Migration and upgrade tasks

---

## Technical Architecture

### Project Structure

```
project/
├── public/                      # Static assets
│   ├── locales/                # i18n translation files (JSON)
│   │   ├── en/                 # English translations
│   │   ├── da/                 # Danish translations
│   │   ├── de/                 # German translations
│   │   ├── fr/                 # French translations
│   │   └── ... (11 total)
│   ├── blog/                   # Generated static HTML blog posts
│   │   ├── index.html          # English blog listing
│   │   └── {slug}/index.html   # Individual post pages
│   ├── {lang}/blog/            # Translated blog HTML
│   ├── images/                 # Static images
│   ├── _redirects              # Netlify routing rules
│   ├── _headers                # HTTP headers configuration
│   ├── robots.txt              # Search engine directives
│   └── sitemap*.xml            # SEO sitemaps (25 total)
│
├── src/                        # React application source
│   ├── components/             # React components
│   │   ├── admin/              # Admin dashboard components
│   │   ├── auth/               # Authentication components
│   │   ├── blog/               # Blog components
│   │   ├── legal/              # Legal pages (Privacy, Terms)
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Library integrations (Supabase)
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── i18n.ts                 # i18next configuration
│   └── index.css               # Global styles (Tailwind)
│
├── scripts/                    # Build and utility scripts
│   ├── generate-blog-html.js   # Generate static blog HTML
│   ├── generate-sitemap.mjs    # Generate XML sitemaps
│   └── validate-sitemaps.mjs   # Validate sitemap structure
│
├── supabase/                   # Supabase configuration
│   ├── migrations/             # Database migrations (42 files)
│   ├── functions/              # Edge functions
│   │   ├── translate-post/     # AI translation service
│   │   └── ping-search-consoles/ # SEO ping service
│   ├── templates/              # Email templates
│   └── config.toml             # Supabase config
│
├── .env                        # Environment variables (Supabase keys)
├── vite.config.ts              # Vite bundler configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

### Technology Stack

#### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.5.3** - Type safety
- **Vite 5.4.2** - Build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Lucide React 0.344.0** - Icon library

#### Internationalization
- **i18next 23.7.6** - Translation framework
- **react-i18next 13.5.0** - React bindings
- **i18next-http-backend 2.4.2** - Load translations from JSON files
- **i18next-browser-languagedetector 7.2.0** - Auto-detect user language

#### Backend & Services
- **Supabase 2.57.4** - PostgreSQL database, auth, storage
- **Row Level Security (RLS)** - Database-level access control
- **Edge Functions** - Serverless functions (Deno runtime)

#### Content & SEO
- **DOMPurify 3.3.0** - HTML sanitization
- **xmlbuilder2 3.1.1** - Generate XML sitemaps

### Routing Architecture

Netlify now follows a static-first routing strategy:

```
┌─────────────────────────────────────────────────────┐
│      Request for /{lang}/blog/... arrives at CDN    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Netlify Routing Engine    │
        │  (Reads public/_redirects) │
        └────────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   Match explicit blog rule   Serve /{lang}/blog/.../index.html
```

**Key Points:**
1. Blog listings and posts are enumerated with unconditional `200` rewrites.
2. No user-agent detection or JavaScript redirects are involved.
3. A final catch-all rule (`/* /index.html 200`) keeps the React SPA online for non-blog routes.
4. The SPA router (`src/App.tsx`) deliberately ignores `/blog` paths; the only in-app entry to the blog is an explicit hash-based visit such as `/#blog`, keeping normal blog traffic on static HTML.

---

## Working with AI Assistants

### Understanding the Environment

When working with **OpenAI Codex** or **Claude Code** on this project:

#### ✅ What You CAN Do

1. **Read any file** in the project
2. **Modify existing files** (components, hooks, utils, styles)
3. **Create new files** (components, utilities, migrations)
4. **Run build commands** (`npm run build`, `npm run dev`)
5. **Execute scripts** (generate-blog-html.js, generate-sitemap.mjs)
6. **Query the database** (via Supabase client)
7. **Test changes** (run the application locally)
8. **Analyze performance** (profile builds, bundle sizes)

#### ❌ What You CANNOT Do

1. **Modify Supabase infrastructure** directly (use migrations instead)
2. **Change environment variables** in production (they're managed by Netlify)
3. **Deploy to production** (deployment is handled by Netlify CI/CD)
4. **Access production database** directly (use Supabase dashboard or migrations)
5. **Modify Netlify configuration** outside of `_redirects` and `_headers`

### Environment Variables

**Location**: `/tmp/cc-agent/60079893/project/.env`

```bash
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Important Notes:**
- These are **anonymous (public) keys** - safe to use client-side
- Service role keys are stored in Supabase, NOT in `.env`
- All variables prefixed with `VITE_` are exposed to the browser
- Never commit sensitive keys to version control

### Supabase Access

**Client Initialization**: `src/lib/auth.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY
);
```

**Usage in Components**:

```typescript
import { supabase } from '@/lib/supabase';

// Query data
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published');

// Insert data
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'New Post', slug: 'new-post' });
```

---

## Key Systems & Features

### 1. Multilingual System (i18n)

**Configuration**: `src/i18n.ts`

```typescript
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'da', 'sv', 'no', 'fi', 'de', 'fr', 'es', 'it', 'pt', 'nl'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });
```

**Translation Files**: `public/locales/{lang}/{namespace}.json`

**Namespaces**:
- `common.json` - Shared strings (buttons, labels)
- `header.json` - Navigation menu
- `hero.json` - Homepage hero section
- `features.json` - Features section
- `benefits.json` - Benefits section
- `industries.json` - Industry-specific content
- `blog.json` - Blog UI strings
- `seo.json` - SEO meta tags
- And more...

**Usage in Components**:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation('namespace');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button onClick={() => i18n.changeLanguage('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

**Language Switching Flow**:
1. User clicks language in `LanguageSwitcher` component
2. `i18n.changeLanguage(lang)` is called
3. URL updates to `/{lang}/` (e.g., `/fr/`)
4. React re-renders with new translations
5. All components update automatically

### 2. Blog System (Multilingual CMS)

**Architecture**: Dual-layer system
- **Static HTML** (for SEO and primary delivery) - Generated at build time and served directly for every `/blog` path.
- **React SPA** (for admin and explicit hash visits) - Only renders the listing when users intentionally visit `/#blog`; normal blog traffic never hydrates the SPA.

#### Database Tables

**posts** - English blog posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  original_language TEXT DEFAULT 'en',
  author_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
  featured_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  focus_keyword TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**post_translations** - Translated blog posts
```sql
CREATE TABLE post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL, -- Language-specific slug
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  translation_status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'failed'
  published BOOLEAN DEFAULT false,
  translated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, language_code)
);
```

#### Static HTML Generation

**Script**: `scripts/generate-blog-html.js`

**Process**:
1. Queries Supabase for all published posts and translations
2. Generates HTML files with full SEO meta tags
3. Creates 93 static files:
   - 11 blog listing pages (1 per language)
   - 82 individual post pages (English + translations)
4. Includes JSON-LD structured data
5. Adds hreflang tags for language alternates

**Generated Files**:
```
public/blog/index.html
public/blog/post-slug/index.html
public/da/blog/index.html
public/da/blog/danish-post-slug/index.html
public/de/blog/index.html
public/de/blog/german-post-slug/index.html
... (and so on for all languages)
```

**Run Command**:
```bash
npm run generate-blog-html
```

#### React Blog Components

**BlogSection** (`src/components/blog/BlogSection.tsx`)
- Renders only when the URL hash is `#blog` or `#blog/`, preventing the SPA from mounting on `/blog` path requests that Netlify already serves statically.
- Extracts language from the surrounding path for hash-based visits and scrolls to top on entry.
- Shows the listing view exclusively; post-level rendering is deferred to static HTML.

**BlogList** (`src/components/blog/BlogList.tsx`)
- Fetches all published posts for current language.
- Displays posts in responsive grid.
- Ensures card links point directly to trailing-slash static pages (e.g., `/fr/blog/slug/`) so navigation never detours through the SPA.
- Uses `useBlogPosts` hook.

**BlogPost** (`src/components/blog/BlogPost.tsx`)
- Retained for admin and preview scenarios but not rendered during normal navigation because the SPA does not handle `/blog` routes.
- Uses `useBlogPost` hook if invoked.

**Key Hooks**:
- `useBlogPosts(language, limit)` - Fetch multiple posts
- `useBlogPost(slug, language)` - Fetch single post
- `useBlogCategories()` - Fetch categories

### 3. SEO System

#### Sitemaps

**Generated by**: `scripts/generate-sitemap.mjs`

**Architecture**: 25 XML files
- `sitemap.xml` - Main index (references all others)
- `sitemap-core.xml` - Core pages (homepage, calculator, etc.)
- `sitemap-industries-{lang}.xml` - Industry pages (11 files)
- `sitemap-blog-{lang}.xml` - Blog posts (11 files)

**Features**:
- Dynamic generation from Supabase
- Language-specific URLs with hreflang tags
- Priority and changefreq optimization
- Automatic lastmod timestamps

**Discovery Methods** (5 redundant layers):
1. `robots.txt` - Lists all 25 sitemaps explicitly
2. HTML `<link rel="sitemap">` tag in `index.html`
3. Netlify serves with proper `Content-Type: application/xml` headers
4. Standard `/sitemap.xml` URL convention
5. Sitemap index structure (recursive discovery)

**Run Command**:
```bash
npm run generate-sitemap
```

#### Meta Tags & Structured Data

**Component**: `src/components/SEO.tsx`

**Generates**:
- Title and description tags
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Canonical URLs
- Language alternates (hreflang)
- JSON-LD structured data (Article, Organization, Breadcrumb)

**Usage**:
```typescript
<SEO
  title="Best KYC Platforms for 2025"
  description="Comprehensive guide to KYC platforms..."
  keywords="KYC, AML, compliance"
  type="article"
/>
```

### 4. Authentication System

**Provider**: Supabase Auth with email/password

**Components**:
- `LoginPage` - User login form
- `SignupPage` - User registration
- `AuthGuard` - Protected route wrapper
- `AuthStatus` - Display current auth state

**Hook**: `useAuth()` (`src/hooks/useAuth.ts`)

```typescript
const { user, loading, signIn, signUp, signOut } = useAuth();

// Sign in
await signIn(email, password);

// Sign up
await signUp(email, password);

// Sign out
await signOut();
```

**Protected Routes**:
```typescript
<AuthGuard>
  <AdminDashboard />
</AuthGuard>
```

### 5. Admin Dashboard

**Location**: `src/components/admin/AdminDashboard.tsx`

**Features**:
- Blog post creation and editing
- Translation management
- Rich text editor (UnifiedRichTextEditor)
- Image upload to Supabase Storage
- SEO meta tag editor
- Publish/unpublish posts

**Access**: `/cms` (requires authentication)

**Components**:
- `BlogAdmin` - Main blog management interface
- `PostEditor` - Create/edit posts
- `TranslationEditor` - Manage translations
- `ImageUploader` - Upload blog images
- `SEOTab` - Edit meta tags

---

## Database Schema

### Core Tables

#### auth.users (Supabase Managed)
- `id` - UUID primary key
- `email` - User email
- `created_at` - Registration timestamp

#### user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### roles
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'admin', 'editor', 'viewer'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### user_roles
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);
```

#### posts (see above)
#### post_translations (see above)

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### tags
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### post_categories
```sql
CREATE TABLE post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
```

#### post_tags
```sql
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

### Row Level Security (RLS) Policies

**posts table**:
```sql
-- Public can view published posts
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  TO public
  USING (status = 'published');

-- Authenticated admins can manage all posts
CREATE POLICY "Admins can manage posts"
  ON posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );
```

**post_translations table**:
```sql
-- Public can view published translations
CREATE POLICY "Public can view published translations"
  ON post_translations FOR SELECT
  TO public
  USING (published = true);

-- Authenticated admins can manage translations
CREATE POLICY "Admins can manage translations"
  ON post_translations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );
```

### Storage Buckets

**blog-images** - Blog post images
- Public read access
- Authenticated write access (admins only via RLS)
- Supports: PNG, JPG, JPEG, GIF, WebP
- Max file size: 5MB

---

## Development Workflows

### 1. Working with Blog Posts

#### Creating a New Blog Post

**Via Admin Dashboard**:
1. Navigate to `/cms`
2. Log in with admin credentials
3. Click "Create New Post"
4. Fill in:
   - Title
   - Slug (URL-friendly)
   - Content (rich text editor)
   - Excerpt (summary)
   - Meta tags (SEO)
   - Featured image
5. Click "Publish"

**Database Direct** (for AI assistants):
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'New Blog Post',
    slug: 'new-blog-post',
    content: '<p>Post content here...</p>',
    excerpt: 'A brief summary',
    status: 'published',
    meta_title: 'SEO Title',
    meta_description: 'SEO description',
    meta_keywords: 'keyword1, keyword2',
    focus_keyword: 'main keyword',
    published_at: new Date().toISOString(),
  });
```

#### Adding Translations

**Via Admin Dashboard**:
1. Select existing post
2. Click "Add Translation"
3. Choose language
4. Translate all fields
5. Publish translation

**Using Edge Function** (AI-powered):
```bash
# Calls supabase/functions/translate-post
POST /functions/v1/translate-post
{
  "postId": "uuid",
  "targetLanguage": "de"
}
```

**Database Direct**:
```typescript
const { data, error } = await supabase
  .from('post_translations')
  .insert({
    post_id: 'post-uuid',
    language_code: 'de',
    title: 'Translated Title',
    slug: 'translated-slug',
    content: '<p>Translated content...</p>',
    excerpt: 'Translated excerpt',
    meta_title: 'Translated SEO title',
    meta_description: 'Translated SEO description',
    meta_keywords: 'german, keywords',
    published: true,
    translation_status: 'completed',
  });
```

#### Regenerating Static HTML

**After creating/updating posts**:
```bash
npm run generate-blog-html
```

This queries Supabase and generates all 93 static HTML files.

#### Regenerating Sitemaps

**After blog changes**:
```bash
npm run generate-sitemap
```

### 2. Adding New Components

**Location**: `src/components/`

**Example - Creating a new feature component**:

```typescript
// src/components/NewFeature.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function NewFeature() {
  const { t } = useTranslation('common');

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          {t('newFeature.title')}
        </h2>
        <p className="text-lg text-gray-600">
          {t('newFeature.description')}
        </p>
      </div>
    </section>
  );
}
```

**Add translations**:
```json
// public/locales/en/common.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description of the new feature"
  }
}
```

**Import in App.tsx**:
```typescript
import NewFeature from './components/NewFeature';

// Add to HomePage component
<NewFeature />
```

### 3. Database Migrations

**Location**: `supabase/migrations/`

**Naming Convention**: `YYYYMMDDHHMMSS_descriptive_name.sql`

**Example - Adding a new table**:

```sql
/*
  # Add comments table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `comments` table
    - Add policy for users to read all comments
    - Add policy for users to create their own comments
    - Add policy for users to delete their own comments
*/

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Public can view comments"
  ON comments FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_comments_post_id ON comments(post_id);
```

**Apply Migration** (via Supabase Dashboard or CLI):
```bash
supabase migration up
```

### 4. Adding New Routes

**Netlify Redirects**: `public/_redirects`

**Example - Adding a new legal page**:

```nginx
# Add before the fallback rule
/privacy-policy             /index.html                     200
/da/privacy-policy          /index.html                     200
/de/privacy-policy          /index.html                     200
# ... (add for all languages)
```

**React Routing** in `src/App.tsx`:

```typescript
// Parse pathname
const pathname = window.location.pathname;

if (pathname.includes('/privacy-policy')) {
  return <PrivacyPolicy />;
}
```

### 5. Adding Translations

**Process**:
1. Identify the namespace (e.g., `common`, `header`, `blog`)
2. Add key-value pairs to English JSON: `public/locales/en/{namespace}.json`
3. Copy structure to all 10 other languages
4. Translate values (or use translation service)

**Example**:

```json
// public/locales/en/common.json
{
  "newButton": "Click Me",
  "newMessage": "Welcome to our platform"
}

// public/locales/de/common.json
{
  "newButton": "Klick mich",
  "newMessage": "Willkommen auf unserer Plattform"
}

// public/locales/fr/common.json
{
  "newButton": "Cliquez-moi",
  "newMessage": "Bienvenue sur notre plateforme"
}
```

---

## Build & Deployment

### Build Process

**Full Build Command**:
```bash
npm run build
```

**What it does**:
1. Runs `generate-blog-html.js` - Creates 93 static HTML files
2. Runs `generate-sitemap.mjs` - Creates 25 XML sitemap files
3. Runs `vite build` - Builds React application
4. Runs `validate-sitemaps.mjs` - Validates sitemap structure

**Output**: `dist/` directory with:
- Bundled JavaScript files
- CSS files
- Static HTML blog pages
- XML sitemaps
- Static assets (images, fonts)

### Development Server

**Start Dev Server**:
```bash
npm run dev
```

**Access**: `http://localhost:5173` (Vite default)

**Features**:
- Hot module replacement (HMR)
- Fast refresh for React components
- TypeScript error checking
- ESLint integration

### Build Scripts

**Individual Commands**:

```bash
# Generate blog HTML only
npm run generate-blog-html

# Generate sitemaps only
npm run generate-sitemap

# Validate sitemaps
npm run validate-sitemaps

# Validate sitemaps against production
npm run test:sitemaps:production

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Netlify Deployment

**Configuration**: Netlify automatically deploys when:
1. Code is pushed to main branch (Git integration)
2. Build command: `npm run build`
3. Publish directory: `dist`

**Environment Variables** (set in Netlify dashboard):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_SUPABASE_ANON_KEY`

**Custom Headers**: `public/_headers`

```nginx
/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600
  X-Robots-Tag: all

/sitemap-*.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600
  X-Robots-Tag: all
```

**Redirect Rules**: `public/_redirects` (see Technical Architecture section)

---

## Common Tasks

### 1. Debugging a Component

**Problem**: Component not rendering correctly

**Steps**:
1. Check browser console for errors
2. Verify component imports
3. Check translation keys exist in JSON files
4. Verify data is loading from Supabase
5. Use React DevTools to inspect component state

**Example**:
```typescript
// Add debug logging
console.log('Component props:', props);
console.log('Translation key:', t('key'));
console.log('Supabase data:', data);

// Check for errors
if (error) {
  console.error('Supabase error:', error);
}
```

### 2. Fixing Translation Missing

**Problem**: Translation key showing as `blog.title` instead of actual text

**Steps**:
1. Check if key exists in `public/locales/{lang}/{namespace}.json`
2. Verify namespace is loaded in component: `useTranslation('namespace')`
3. Check i18n configuration in `src/i18n.ts`
4. Clear browser cache and reload

**Fix**:
```json
// Add missing key to JSON file
{
  "blog": {
    "title": "Our Blog"
  }
}
```

### 3. Database Query Not Working

**Problem**: Supabase query returning no data

**Steps**:
1. Check RLS policies - ensure user has permission
2. Verify table/column names match schema
3. Check filter conditions (`.eq()`, `.filter()`)
4. Use Supabase dashboard to test query manually

**Common Issue - RLS Blocking Query**:
```typescript
// Problem: Query filtered by RLS
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'draft'); // RLS may block drafts

// Solution: Check RLS policy or sign in as admin
```

### 4. Static HTML Not Updating

**Problem**: Blog post changes not reflected in static HTML

**Steps**:
1. Run `npm run generate-blog-html`
2. Check if script completed successfully
3. Verify files exist in `public/blog/` directory
4. Clear CDN cache (Netlify dashboard)
5. Hard refresh browser (Ctrl+Shift+R)

### 5. Route Not Working

**Problem**: URL shows 404 or wrong content

**Steps**:
1. Check `public/_redirects` for matching rule
2. Verify React routing logic in `src/App.tsx`
3. Test with different user agents (browser vs crawler)
4. Check Netlify deploy logs for redirect errors

**Test Crawler Route**:
```bash
curl -A "Googlebot" https://veridaq.com/blog/post-slug
```

**Test Browser Route**:
```bash
curl -A "Mozilla/5.0" https://veridaq.com/blog/post-slug
```

### 6. Adding a New Language

**Steps**:
1. Add language code to `src/i18n.ts`:
   ```typescript
   supportedLngs: ['en', 'da', ..., 'pl'], // Add Polish
   ```

2. Create translation files:
   ```bash
   mkdir -p public/locales/pl
   # Copy all JSON files from public/locales/en/ to public/locales/pl/
   ```

3. Translate JSON values in all namespace files

4. Add language to `LanguageSwitcher` component:
   ```typescript
   const languages = [
     { code: 'en', name: 'English', flag: '🇬🇧' },
     // ... existing languages
     { code: 'pl', name: 'Polski', flag: '🇵🇱' },
   ];
   ```

5. Add routes to `public/_redirects`:
   ```nginx
   /pl/*                           /index.html                     200
   /pl/blog/*                      /pl/blog/:splat/index.html      200   User-Agent=*bot*
   /pl/blog/*                      /index.html                     200
   ```

6. Update sitemap generation script to include Polish

7. Test language switching and routing

---

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module" Error

**Cause**: Missing TypeScript path aliases or incorrect imports

**Fix**:
```typescript
// Bad
import { supabase } from '../../../lib/supabase';

// Good
import { supabase } from '@/lib/supabase';

// Or relative path
import { supabase } from '@/lib/supabase';
```

Check `tsconfig.json` for path configuration.

#### Issue: Supabase Query Returns Empty Array

**Cause**: Row Level Security (RLS) blocking query

**Debug**:
```typescript
// Check if error exists
const { data, error } = await supabase
  .from('posts')
  .select('*');

if (error) {
  console.error('Supabase error:', error);
}

// Check RLS policies in Supabase dashboard
```

**Fix**: Sign in as admin or adjust RLS policy for your use case.

#### Issue: Translations Not Loading

**Cause**:
- Translation file doesn't exist
- Namespace not loaded
- i18n not initialized

**Fix**:
1. Verify file exists: `public/locales/{lang}/{namespace}.json`
2. Load namespace: `useTranslation('namespace')`
3. Check browser network tab for 404s loading JSON files

#### Issue: Static HTML Shows React Code

**Cause**: Build script didn't run or failed

**Fix**:
```bash
npm run generate-blog-html
```

Check console for errors. Common issues:
- Supabase connection failure
- Missing environment variables
- Database query errors

#### Issue: 404 on Blog Post URL

**Cause**:
- Static HTML file not generated
- Netlify redirect not matching
- Slug mismatch

**Fix**:
1. Check file exists: `public/blog/{slug}/index.html`
2. Verify redirect rule in `public/_redirects`
3. Test with curl:
   ```bash
   curl -A "Googlebot" https://veridaq.com/blog/your-slug
   ```

#### Issue: Build Fails with TypeScript Error

**Cause**: Type mismatches or missing types

**Fix**:
```bash
# Run type check
npx tsc --noEmit

# Common fixes:
# 1. Add proper types
# 2. Use 'any' temporarily (not recommended)
# 3. Fix import paths
```

#### Issue: Component Re-renders Infinitely

**Cause**:
- Missing dependency in useEffect
- State update causing re-render loop

**Fix**:
```typescript
// Bad
useEffect(() => {
  setData(fetchData()); // Re-renders infinitely
});

// Good
useEffect(() => {
  fetchData().then(setData);
}, []); // Empty dependency array
```

#### Issue: Language Switch Not Working

**Cause**:
- i18n not detecting language change
- URL not updating
- Translation files not loading

**Debug**:
```typescript
const { i18n } = useTranslation();
console.log('Current language:', i18n.language);
console.log('Available languages:', i18n.languages);
```

**Fix**:
1. Verify `i18n.changeLanguage(lang)` is called
2. Check URL updates to `/{lang}/`
3. Ensure translation files exist for target language

---

## AI Assistant Best Practices

### When Using OpenAI Codex or Claude Code

#### ✅ DO:

1. **Read Files First**
   - Always read existing code before modifying
   - Understand component structure and patterns
   - Check for existing implementations

2. **Follow Existing Patterns**
   - Match code style (TypeScript, functional components)
   - Use existing hooks and utilities
   - Follow naming conventions

3. **Test Changes**
   - Run `npm run build` after modifications
   - Test in browser with `npm run dev`
   - Verify translations load correctly

4. **Maintain Type Safety**
   - Add proper TypeScript types
   - Don't use `any` unless absolutely necessary
   - Update interfaces when changing data structures

5. **Consider Multilingual Impact**
   - Changes affecting text require translation updates
   - Update all 11 language JSON files
   - Test with different languages active

6. **Document Complex Logic**
   - Add comments for non-obvious code
   - Update this architecture doc if needed
   - Create migration summaries

7. **Handle Errors Gracefully**
   - Add try-catch blocks for async operations
   - Display user-friendly error messages
   - Log errors for debugging

#### ❌ DON'T:

1. **Don't Break Existing Features**
   - Test thoroughly before committing
   - Check blog, translation, auth systems
   - Verify SEO isn't impacted

2. **Don't Hardcode Strings**
   - Always use i18n for user-facing text
   - Add translation keys to JSON files
   - Never bypass translation system

3. **Don't Bypass RLS**
   - Respect database security policies
   - Don't use service role key client-side
   - Test with actual user permissions

4. **Don't Ignore Build Warnings**
   - Fix TypeScript errors
   - Address ESLint warnings
   - Resolve dependency issues

5. **Don't Skip Static Generation**
   - Always run `generate-blog-html` after blog changes
   - Regenerate sitemaps when routes change
   - Validate sitemaps after generation

6. **Don't Modify Core Infrastructure**
   - Don't change Vite config without good reason
   - Don't alter Supabase connection logic
   - Don't break Netlify redirect rules

### Efficient Workflows

#### Understanding the Codebase

```bash
# 1. Read project structure
ls -R src/

# 2. Understand routing
cat public/_redirects

# 3. Check database schema
cat supabase/migrations/*.sql

# 4. Review main app logic
cat src/App.tsx

# 5. Check translation structure
ls public/locales/en/
```

#### Making Changes Safely

```bash
# 1. Create a branch (if using Git)
git checkout -b feature/new-feature

# 2. Make changes to files
# (use Edit tool)

# 3. Test locally
npm run dev

# 4. Build to verify
npm run build

# 5. Test specific functionality
# (navigate to changed pages)

# 6. Commit changes
git add .
git commit -m "Description of changes"
```

#### Debugging Issues

```bash
# 1. Check for TypeScript errors
npx tsc --noEmit

# 2. Check for ESLint warnings
npm run lint

# 3. Check build output
npm run build 2>&1 | less

# 4. Check Supabase queries
# (add console.log to component)

# 5. Inspect browser console
# (open DevTools in browser)
```

---

## Quick Reference

### Important File Locations

```
Configuration:
├── vite.config.ts          - Vite bundler config
├── tailwind.config.js      - Tailwind CSS config
├── tsconfig.json           - TypeScript config
├── .env                    - Environment variables
└── package.json            - Dependencies and scripts

Routing:
├── public/_redirects       - Netlify routing rules
└── public/_headers         - HTTP headers config

Translations:
└── public/locales/{lang}/*.json

Components:
├── src/components/         - All React components
├── src/hooks/              - Custom hooks
├── src/lib/                - Library integrations
└── src/utils/              - Utility functions

Database:
├── supabase/migrations/    - Database migrations
├── supabase/functions/     - Edge functions
└── src/lib/supabase.ts     - Database types

Build Scripts:
└── scripts/
    ├── generate-blog-html.js
    ├── generate-sitemap.mjs
    └── validate-sitemaps.mjs
```

### Key Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build               # Full production build
npm run preview             # Preview production build
npm run lint                # Run ESLint

# Blog Management
npm run generate-blog-html  # Generate static blog HTML
npm run generate-sitemap    # Generate XML sitemaps
npm run validate-sitemaps   # Validate sitemap structure

# Testing
npm run test:sitemaps:production  # Validate production sitemaps
```

### Supabase Tables Quick Reference

```typescript
// Posts (English)
supabase.from('posts')

// Translations
supabase.from('post_translations')

// User profiles
supabase.from('user_profiles')

// Roles
supabase.from('roles')

// User roles
supabase.from('user_roles')

// Categories
supabase.from('categories')

// Tags
supabase.from('tags')

// Post categories
supabase.from('post_categories')

// Post tags
supabase.from('post_tags')
```

### Translation Namespaces

```typescript
// Available namespaces
'common'
'header'
'footer'
'hero'
'features'
'benefits'
'industries'
'compliance'
'complianceChecklist'
'contact'
'roiCalculator'
'scrollCTA'
'trustSignals'
'liveChat'
'blog'
'seo'
```

### Supported Languages

```typescript
const LANGUAGES = [
  'en', // English
  'da', // Danish
  'sv', // Swedish
  'no', // Norwegian
  'fi', // Finnish
  'de', // German
  'fr', // French
  'es', // Spanish
  'it', // Italian
  'pt', // Portuguese
  'nl', // Dutch
];
```

---

## Summary for AI Assistants

### Your Role

As an AI assistant working on this project:

1. **You're working OUTSIDE Bolt.new** - This is a local/cloud development environment
2. **Bolt.new scaffolded this project** - But you're now doing deep development work
3. **You have full codebase access** - Read, modify, create files as needed
4. **Supabase is pre-configured** - Database connection is ready to use
5. **Multilingual support is critical** - Always consider translation impact
6. **SEO is paramount** - Static HTML generation and sitemaps are crucial
7. **Static-first blog delivery** - Same HTML for crawlers and users

### What Makes This Project Special

1. **Static Blog Architecture**
   - Static HTML is the single source of truth
   - `_redirects` lists unconditional rewrites per locale
   - React SPA only powers non-blog routes

2. **11-Language Support**
   - All UI text in JSON translation files
   - Blog posts translated in database
   - SEO meta tags per language

3. **Advanced SEO**
   - 25 XML sitemaps
   - 5 redundant discovery methods
   - Dynamic hreflang tags
   - JSON-LD structured data

4. **Sophisticated Routing**
   - Explicit blog rewrites for every language
   - React client-side routing for application views
   - SPA fallback kept as the final rule

### Your Capabilities

You can:
- ✅ Analyze and understand complex codebases
- ✅ Debug multi-file issues
- ✅ Optimize database queries and performance
- ✅ Refactor large sections of code
- ✅ Add new features with proper typing
- ✅ Write and apply database migrations
- ✅ Update multiple translation files
- ✅ Test and validate changes

### Your Limitations

You cannot:
- ❌ Deploy to production (Netlify CI/CD handles this)
- ❌ Modify Supabase infrastructure (use migrations)
- ❌ Access production environment directly
- ❌ Change Netlify configuration outside code

---

## Getting Help

### Documentation Resources

1. **Project Docs**
   - `BLOG_ARCHITECTURE.md` - Detailed blog system architecture
   - `BLOG_ROUTING_FIX_SUMMARY.md` - Routing implementation details
   - `SUPABASE_SETUP_INSTRUCTIONS.md` - Database setup guide

2. **External Docs**
   - [React Documentation](https://react.dev)
   - [Vite Documentation](https://vitejs.dev)
   - [Supabase Documentation](https://supabase.com/docs)
   - [i18next Documentation](https://www.i18next.com)
   - [Tailwind CSS Documentation](https://tailwindcss.com/docs)
   - [Netlify Redirects](https://docs.netlify.com/routing/redirects/)

3. **TypeScript Types**
   - Check `src/lib/supabase.ts` for database types
   - Use VSCode IntelliSense for autocomplete
   - Run `npx tsc --noEmit` to check types

### Debugging Tips

1. **Browser DevTools**
   - Console for errors and logs
   - Network tab for API requests
   - React DevTools for component inspection

2. **Supabase Dashboard**
   - Table Editor for data inspection
   - SQL Editor for custom queries
   - Storage for image management
   - Logs for function debugging

3. **Build Output**
   - Check `dist/` for generated files
   - Verify static HTML exists
   - Inspect bundle sizes

---

**End of Documentation**

This guide should help you understand the complete architecture and work effectively on the Veridaq project. Always prioritize:
1. **Type safety** (TypeScript)
2. **Multilingual support** (i18n)
3. **SEO optimization** (static HTML, sitemaps)
4. **User experience** (React SPA)
5. **Security** (RLS, authentication)

Good luck with your development work!
