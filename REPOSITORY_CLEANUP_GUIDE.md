# Repository Size Reduction Guide

Your GitHub repository is too large for bolt.new to import (likely >100MB with git history).

## Problem
- Generated HTML files were committed to git history multiple times
- Git history contains large files that bloat the repository
- bolt.new cannot clone repositories over ~100MB

## Solution: Create Fresh Repository

### Step 1: Clone Current Repository Locally
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git repo-backup
cd repo-backup
```

### Step 2: Check Repository Size
```bash
# Check size including git history
du -sh .git
# Common culprits:
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sort -k3 -n -r | head -20
```

### Step 3: Create Fresh Repository (Recommended)

#### Option A: Squash All History (Keeps Single Commit)
```bash
# Create orphan branch with no history
git checkout --orphan fresh-start

# Remove generated files that shouldn't be tracked
rm -rf public/blog public/*/blog public/sitemap-original-backup.xml
rm -f vite.config.ts.timestamp-*.mjs
rm -rf supabase/.temp

# Stage all current files
git add -A
git commit -m "Fresh start: Clean repository with proper .gitignore"

# Replace main branch
git branch -D main
git branch -m main

# Force push (WARNING: This replaces all history)
git push -f origin main
```

#### Option B: Create Entirely New Repository (Safest)
```bash
# 1. Create new repository on GitHub (don't initialize with README)
# 2. In your local cleaned directory:

cd /path/to/your/project
rm -rf .git  # Remove old git history

# Initialize fresh repository
git init
git add .
git commit -m "Initial commit: Clean project"

# Connect to new GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/NEW_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 4: Verify Size
```bash
# Should be <10MB
du -sh .git
```

### Step 5: Import to bolt.new
1. Go to bolt.new
2. Import from your NEW repository URL
3. Should work without 422 errors

## Prevention: Update .gitignore

Your `.gitignore` is already updated with:
```gitignore
# Generated blog HTML files (created at build time)
public/blog/
public/*/blog/
public/sitemap-original-backup.xml

# Vite cache files
*.timestamp-*.mjs
.vite/

# Supabase temp files
supabase/.temp/
```

These files will be generated during build and should never be committed.

## Alternative: Use Git LFS for Large Files

If you need to keep some large files:
```bash
git lfs install
git lfs track "*.png"
git lfs track "*.jpg"
git add .gitattributes
git commit -m "Configure Git LFS"
```

## Quick Check Before Pushing
```bash
# Always check what you're committing
git status
find . -name "*.html" -path "*/blog/*"  # Should be empty
find . -name "*.timestamp-*.mjs"         # Should be empty
```

## After Creating Fresh Repo

1. **Update bolt.new connection**: Import from the new repository
2. **Update deployment**: Point your hosting to the new repo
3. **Archive old repo**: Rename it to `project-archived` for backup
