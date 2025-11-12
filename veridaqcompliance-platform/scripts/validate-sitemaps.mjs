#!/usr/bin/env node

/**
 * Automated Sitemap Validation Script
 *
 * Tests critical sitemap endpoints to ensure they return valid XML
 * with correct Content-Type headers. Fails the build if any issues found.
 *
 * Usage:
 *   node scripts/validate-sitemaps.mjs
 *   node scripts/validate-sitemaps.mjs --url https://veridaq.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCAL_DIST = path.join(__dirname, '..', 'dist');
const args = process.argv.slice(2);
const isProduction = args.includes('--url');
const BASE_URL = isProduction ? args[args.indexOf('--url') + 1] : null;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Sitemap endpoints to test
const SITEMAP_ENDPOINTS = [
  '/sitemap.xml',
  '/sitemap-core.xml',
  '/sitemap-blog-en.xml',
  '/sitemap-industries-en.xml',
  '/robots.txt',
  '/.well-known/ai-plugin.json',
];

// Common alias URLs that should redirect to main sitemap
const SITEMAP_ALIASES = [
  '/sitemap_index.xml',
  '/sitemapindex.xml',
  '/blog/sitemap.xml',
];

// Paths that should return 404, not SPA fallback
const SHOULD_404 = [
  '/_sitemap/nonexistent.xml',
  '/wp-sitemap.xml',
];

let hasErrors = false;
let testCount = 0;
let passCount = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  hasErrors = true;
}

function success(message) {
  log(`✅ ${message}`, 'green');
  passCount++;
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

/**
 * Check if file exists and contains valid XML
 */
function validateLocalFile(filePath) {
  testCount++;
  const fullPath = path.join(LOCAL_DIST, filePath);

  if (!fs.existsSync(fullPath)) {
    error(`File does not exist: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Check for XML declaration
  if (filePath.endsWith('.xml')) {
    if (!content.includes('<?xml version="1.0"')) {
      error(`Missing XML declaration in ${filePath}`);
      return false;
    }

    // Check for common XML elements
    if (!content.includes('<urlset') && !content.includes('<sitemapindex')) {
      error(`Invalid XML structure in ${filePath}`);
      return false;
    }

    // Ensure it's not HTML
    if (content.includes('<html') || content.includes('<!DOCTYPE html>')) {
      error(`File contains HTML instead of XML: ${filePath}`);
      return false;
    }
  }

  success(`Valid file: ${filePath} (${(content.length / 1024).toFixed(2)} KB)`);
  return true;
}

/**
 * Validate remote URL (production test)
 */
async function validateRemoteUrl(url, options = {}) {
  testCount++;

  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: {
        'User-Agent': options.userAgent || 'SitemapValidator/1.0',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const status = response.status;

    // Check expected status codes
    if (options.expectRedirect) {
      if (status !== 301 && status !== 302) {
        error(`Expected redirect for ${url}, got ${status}`);
        return false;
      }
      const location = response.headers.get('location');
      info(`Redirects to: ${location}`);
      success(`Redirect OK: ${url} → ${location}`);
      return true;
    }

    if (options.expect404) {
      if (status !== 404) {
        error(`Expected 404 for ${url}, got ${status}`);
        return false;
      }
      success(`Correctly returns 404: ${url}`);
      return true;
    }

    // Check 200 OK
    if (status !== 200) {
      error(`Expected 200 for ${url}, got ${status}`);
      return false;
    }

    // Check content type
    const expectedType = options.expectedType || 'application/xml';
    if (!contentType.includes(expectedType)) {
      error(`Wrong Content-Type for ${url}: ${contentType} (expected ${expectedType})`);
      return false;
    }

    // For XML, verify content
    if (expectedType === 'application/xml') {
      const text = await response.text();

      if (!text.includes('<?xml')) {
        error(`Missing XML declaration in ${url}`);
        return false;
      }

      if (text.includes('<html') || text.includes('<!DOCTYPE html>')) {
        error(`URL returns HTML instead of XML: ${url}`);
        return false;
      }

      success(`Valid XML: ${url} (${(text.length / 1024).toFixed(2)} KB)`);
    } else {
      success(`Valid response: ${url} (Content-Type: ${contentType})`);
    }

    return true;
  } catch (err) {
    error(`Failed to fetch ${url}: ${err.message}`);
    return false;
  }
}

/**
 * Main validation function
 */
async function validateSitemaps() {
  log('\n🔍 Starting Sitemap Validation\n', 'blue');

  if (isProduction && BASE_URL) {
    log(`Testing production environment: ${BASE_URL}\n`, 'yellow');

    // Test main endpoints
    info('Testing main sitemap endpoints...');
    for (const endpoint of SITEMAP_ENDPOINTS) {
      const url = `${BASE_URL}${endpoint}`;
      const expectedType = endpoint.endsWith('.json') ? 'application/json' :
                          endpoint.endsWith('.txt') ? 'text/plain' : 'application/xml';
      await validateRemoteUrl(url, { expectedType });
    }

    // Test aliases (should redirect)
    log('\n');
    info('Testing sitemap aliases (should redirect)...');
    for (const alias of SITEMAP_ALIASES) {
      const url = `${BASE_URL}${alias}`;
      await validateRemoteUrl(url, { expectRedirect: true });
    }

    // Test 404s
    log('\n');
    info('Testing invalid paths (should return 404)...');
    for (const badPath of SHOULD_404) {
      const url = `${BASE_URL}${badPath}`;
      await validateRemoteUrl(url, { expect404: true });
    }

  } else {
    log('Testing local build artifacts...\n', 'yellow');

    // Test local files
    info('Validating sitemap files in dist directory...');
    for (const endpoint of SITEMAP_ENDPOINTS.filter(e => !e.startsWith('/.well-known'))) {
      validateLocalFile(endpoint);
    }

    // Check for additional sitemap files
    log('\n');
    info('Checking for all sitemap-*.xml files...');
    const sitemapFiles = fs.readdirSync(LOCAL_DIST)
      .filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));

    log(`Found ${sitemapFiles.length} sitemap files`, 'cyan');
    for (const file of sitemapFiles) {
      validateLocalFile(`/${file}`);
    }
  }

  // Print summary
  log('\n' + '='.repeat(60), 'blue');
  log(`Tests run: ${testCount}`, 'cyan');
  log(`Passed: ${passCount}`, passCount === testCount ? 'green' : 'yellow');

  if (hasErrors) {
    log(`Failed: ${testCount - passCount}`, 'red');
    log('\n❌ Sitemap validation FAILED\n', 'red');
    process.exit(1);
  } else {
    log('\n✅ All sitemap validation tests PASSED\n', 'green');
    process.exit(0);
  }
}

// Run validation
validateSitemaps().catch(err => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
