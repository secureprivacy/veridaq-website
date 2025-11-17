import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { SUPPORTED_LANGUAGES } from './src/utils/languageUtils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogRoot = path.resolve(__dirname, 'public');
const languagePrefixes = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');

const resolveBlogHtmlPath = (requestPath: string): string | null => {
  const pathname = decodeURIComponent(requestPath.split('?')[0]);
  const segments = pathname.split('/').filter(Boolean);

  let blogBasePath = path.join(blogRoot, 'blog');
  const remainingSegments = [...segments];

  if (remainingSegments[0] && languagePrefixes.includes(remainingSegments[0])) {
    blogBasePath = path.join(blogRoot, remainingSegments[0], 'blog');
    remainingSegments.shift();
  }

  if (remainingSegments[0] !== 'blog' || remainingSegments.includes('..')) {
    return null;
  }

  remainingSegments.shift();

  const slugPath = remainingSegments.join('/');
  const candidatePath = slugPath
    ? path.join(blogBasePath, slugPath, 'index.html')
    : path.join(blogBasePath, 'index.html');

  return fs.existsSync(candidatePath) ? candidatePath : null;
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'dev-blog-static-html-handler',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();

          const blogPath = resolveBlogHtmlPath(req.url);
          if (!blogPath) return next();

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          fs.createReadStream(blogPath).pipe(res);
        });
      },
    },
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
