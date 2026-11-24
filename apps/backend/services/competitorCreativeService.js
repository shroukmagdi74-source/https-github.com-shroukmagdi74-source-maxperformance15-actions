const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

class CompetitorCreativeService {
  constructor() {
    this.creativesDir = path.resolve(__dirname, '../uploads/competitor-creatives');
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.creativesDir)) {
      fs.mkdirSync(this.creativesDir, { recursive: true });
    }
  }

  getPublicUrl(filename) {
    return `/uploads/competitor-creatives/${filename}`;
  }

  async downloadRemoteImage(url, destPath) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return this.downloadRemoteImage(res.headers.location, destPath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download: status ${res.statusCode}`));
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      });
      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Download timeout'));
      });
    });
  }

  generateAdCardSvg(ad, competitorName) {
    const title = (ad.headline || competitorName || 'Meta Ad Creative').replace(/[<>&"]/g, '');
    const copy = (ad.copy || '').replace(/[<>&"]/g, '').slice(0, 140);
    const platform = (ad.platform || 'facebook').toUpperCase();
    const adId = (ad.adId || 'META-AD').replace(/[<>&"]/g, '');
    const cta = (ad.cta || 'عرض التفاصيل').replace(/[<>&"]/g, '');
    const statusText = ad.status === 'active' ? 'نشط' : 'متوقف';
    const statusColor = ad.status === 'active' ? '#10b981' : '#64748b';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="600" height="400" rx="16" fill="url(#bg)"/>
  <rect x="24" y="24" width="552" height="352" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  
  <!-- Header Bar -->
  <g transform="translate(48, 48)">
    <rect width="90" height="24" rx="12" fill="#334155" />
    <text x="45" y="16" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">${platform}</text>
    
    <rect x="100" y="0" width="70" height="24" rx="12" fill="${statusColor}" fill-opacity="0.15" stroke="${statusColor}" stroke-width="1" />
    <text x="135" y="16" fill="${statusColor}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">${statusText}</text>
    
    <text x="504" y="16" fill="#64748b" font-family="monospace" font-size="11" text-anchor="end">ID: ${adId.slice(0, 16)}</text>
  </g>

  <!-- Competitor Name & Headline -->
  <g transform="translate(48, 105)">
    <text x="0" y="16" fill="#60a5fa" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">${competitorName || 'منافس رادار MaxP'}</text>
    <text x="0" y="48" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" textLength="504" lengthAdjust="spacingAndGlyphs">${title.slice(0, 50)}</text>
  </g>

  <!-- Ad Copy Body -->
  <g transform="translate(48, 185)">
    <rect width="504" height="100" rx="8" fill="#0f172a" fill-opacity="0.6" stroke="#1e293b" />
    <text x="16" y="32" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="13" line-height="1.6" textLength="472" lengthAdjust="spacingAndGlyphs">${copy.slice(0, 70)}</text>
    <text x="16" y="60" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" textLength="472" lengthAdjust="spacingAndGlyphs">${copy.slice(70, 140)}</text>
  </g>

  <!-- CTA Action & Branding -->
  <g transform="translate(48, 315)">
    <rect width="140" height="36" rx="8" fill="url(#primary)" />
    <text x="70" y="23" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">${cta}</text>
    
    <text x="504" y="23" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" text-anchor="end">MAXP AD RADAR INTELLIGENCE</text>
  </g>
</svg>`;
  }

  async processAdCreative(ad, competitorName = '') {
    this.ensureDir();
    const adIdentifier = ad.id || ad.adId || `temp-${Date.now()}`;
    const filename = `ad-${adIdentifier}.svg`;
    const destPath = path.join(this.creativesDir, filename);

    // If ad already has an active remote creativeUrl, try downloading it
    if (ad.creativeUrl && ad.creativeUrl.startsWith('http')) {
      const ext = path.extname(new URL(ad.creativeUrl).pathname) || '.jpg';
      const downloadedFilename = `ad-${adIdentifier}${ext}`;
      const downloadedPath = path.join(this.creativesDir, downloadedFilename);
      try {
        await this.downloadRemoteImage(ad.creativeUrl, downloadedPath);
        return this.getPublicUrl(downloadedFilename);
      } catch (err) {
        console.warn(`[CREATIVE] Remote download failed for ad ${adIdentifier}, generating official card:`, err.message);
      }
    }

    // Generate local official snapshot card (zero 404, guaranteed display)
    const svgContent = this.generateAdCardSvg(ad, competitorName);
    fs.writeFileSync(destPath, svgContent, 'utf-8');
    return this.getPublicUrl(filename);
  }
}

module.exports = new CompetitorCreativeService();
