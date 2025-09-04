// Post-build security script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');

console.log('🔒 Applying security enhancements to build...');

// Create security files
const securityFiles = {
  // Netlify redirects (primary SPA fallback)
  '_redirects': `# SPA fallback - CRITICAL for React apps
/*    /index.html   200

# Security redirects
/admin    /    200
/api/*    /    200
/.git/*   /    200
/.env     /    200
/src/*    /    200
/node_modules/*    /    200`,

  // Netlify headers
  '_headers': `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://app-misty-dream-49704848.dpl.myneon.app https://api.stack-auth.com https://api.ipify.org https://api.trongrid.io https://tronscan.org https://check.torproject.org; frame-ancestors 'none';
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/assets/*
  Cache-Control: public, max-age=31536000, immutable`,

  // Robots.txt
  'robots.txt': `User-agent: *
Disallow: /

# Proprietary software - No crawling allowed
# © 2024 USDT NOW. All rights reserved.
# Contact: https://t.me/+lk6DfBs5zhMwYWM0`,

  // Security.txt
  '.well-known/security.txt': `Contact: https://t.me/+lk6DfBs5zhMwYWM0
Expires: 2025-12-31T23:59:59.000Z
Acknowledgments: https://t.me/+lk6DfBs5zhMwYWM0
Preferred-Languages: en, pt
Canonical: https://yourdomain.netlify.app/.well-known/security.txt`,

  // Deployment info
  'deployment-info.json': JSON.stringify({
    name: 'USDT NOW',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    environment: 'production',
    copyright: '© 2024 USDT NOW. All rights reserved.',
    contact: 'https://t.me/+lk6DfBs5zhMwYWM0',
    security: {
      rightClickDisabled: true,
      devToolsProtected: true,
      sourceObfuscated: true,
      copyProtected: true
    }
  }, null, 2)
};

// Create directories if they don't exist
const wellKnownDir = path.join(distPath, '.well-known');
if (!fs.existsSync(wellKnownDir)) {
  fs.mkdirSync(wellKnownDir, { recursive: true });
}

// Write security files
Object.entries(securityFiles).forEach(([filename, content]) => {
  const filePath = path.join(distPath, filename);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created ${filename}`);
});

// Add copyright headers to JS and CSS files
function addCopyrightHeaders(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addCopyrightHeaders(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const copyright = file.endsWith('.js') 
        ? '/*! © 2024 USDT NOW - Proprietary Software - Unauthorized use prohibited */\n'
        : '/*! © 2024 USDT NOW - All rights reserved */\n';
      
      if (!content.startsWith('/*!')) {
        fs.writeFileSync(filePath, copyright + content);
        console.log(`✅ Added copyright to ${file}`);
      }
    }
  });
}

// Apply copyright headers
if (fs.existsSync(distPath)) {
  addCopyrightHeaders(distPath);
}

console.log('🎉 Security enhancements applied successfully!');
console.log('📁 Build is ready for deployment');
console.log('🌐 Upload the dist folder to Netlify');

export default true;
