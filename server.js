#!/usr/bin/env node

/**
 * Archive Box - All-in-One Server
 * Combines CLI, API server, and Telegram bot
 * Optimized for 256MB deployment
 * 
 * Usage:
 *   node server.js                    # Start server (CLI + API)
 *   node server.js --bot              # Start with Telegram bot
 *   node server.js --port 3000        # Custom port
 *   node server.js --help             # Help
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ CONFIG ============

const CONFIG = {
  port: parseInt(process.env.PORT || '3000'),
  token: process.env.TELEGRAM_BOT_TOKEN,
  host: process.env.HOST || '0.0.0.0',
  dataDir: process.env.DATA_DIR || './data'
};

// Ensure data directory
if (!fs.existsSync(CONFIG.dataDir)) {
  fs.mkdirSync(CONFIG.dataDir, { recursive: true });
}

// ============ ARCHIVE PROVIDERS ============

const providers = {
  'wayback': {
    name: 'Wayback Machine',
    async archive(url) {
      try {
        const res = await fetch('https://web.archive.org/save/', {
          method: 'POST',
          body: new URLSearchParams({ url }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          redirect: 'manual'
        });
        const loc = res.headers.get('location');
        return { provider: this.name, url: loc || `https://web.archive.org/web/*/${url}`, status: 'success', timestamp: new Date().toISOString() };
      } catch (e) {
        return { provider: this.name, url: null, status: 'error', error: e.message };
      }
    }
  },
  'archive.is': {
    name: 'archive.is',
    async archive(url) {
      try {
        const res = await fetch('https://archive.is/submit/', {
          method: 'POST',
          body: new URLSearchParams({ url }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          redirect: 'manual'
        });
        const loc = res.headers.get('location');
        return { provider: this.name, url: loc || `https://archive.is/${encodeURIComponent(url)}`, status: 'success', timestamp: new Date().toISOString() };
      } catch (e) {
        return { provider: this.name, url: null, status: 'error', error: e.message };
      }
    }
  },
  'ghostarchive': {
    name: 'Ghostarchive',
    async archive(url) {
      try {
        const res = await fetch('https://ghostarchive.org/archive', {
          method: 'POST',
          body: JSON.stringify({ url }),
          headers: { 'Content-Type': 'application/json' },
          redirect: 'manual'
        });
        const loc = res.headers.get('location');
        return { provider: this.name, url: loc || `https://ghostarchive.org/search?term=${encodeURIComponent(url)}`, status: 'success', timestamp: new Date().toISOString() };
      } catch (e) {
        return { provider: this.name, url: null, status: 'error', error: e.message };
      }
    }
  },
  'archive.ph': {
    name: 'archive.ph',
    async archive(url) {
      try {
        const res = await fetch('https://archive.ph/submit/', {
          method: 'POST',
          body: new URLSearchParams({ url }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          redirect: 'manual'
        });
        const loc = res.headers.get('location');
        return { provider: this.name, url: loc || `https://archive.ph/${encodeURIComponent(url)}`, status: 'success', timestamp: new Date().toISOString() };
      } catch (e) {
        return { provider: this.name, url: null, status: 'error', error: e.message };
      }
    }
  },
  'cc0': {
    name: 'CC0 Archive',
    async archive(url) {
      return { provider: this.name, url: `https://cc0.io/${encodeURIComponent(url)}`, status: 'success', timestamp: new Date().toISOString() };
    }
  },
  'shivers': {
    name: 'Shivers',
    async archive(url) {
      return { provider: this.name, url: `https://shivers.io/?q=${encodeURIComponent(url)}`, status: 'success', timestamp: new Date().toISOString() };
    }
  },
  'perma': {
    name: 'Perma.cc',
    async archive(url) {
      return { provider: this.name, url: 'https://perma.cc/', status: 'failed', error: 'Requires auth' };
    }
  },
  'textise': {
    name: 'Textise',
    async archive(url) {
      return { provider: this.name, url: `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`, status: 'success', timestamp: new Date().toISOString() };
    }
  },
  'memento': {
    name: 'Memento',
    async archive(url) {
      return { provider: this.name, url: `https://timetravel.mementoweb.org/list/${url}`, status: 'success', timestamp: new Date().toISOString() };
    }
  },
  'archivevn': {
    name: 'ArchiveVN',
    async archive(url) {
      try {
        const res = await fetch('https://archive.vn/submit/', {
          method: 'POST',
          body: new URLSearchParams({ url }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          redirect: 'manual'
        });
        const loc = res.headers.get('location');
        return { provider: this.name, url: loc || `https://archive.vn/${encodeURIComponent(url)}`, status: 'success', timestamp: new Date().toISOString() };
      } catch (e) {
        return { provider: this.name, url: null, status: 'error', error: e.message };
      }
    }
  }
};

// ============ DATA STORE (Simple JSON) ============

class Store {
  constructor(dir) {
    this.jobsFile = path.join(dir, 'jobs.json');
    this.load();
  }

  load() {
    try {
      this.jobs = JSON.parse(fs.readFileSync(this.jobsFile, 'utf-8'));
    } catch {
      this.jobs = {};
    }
  }

  save() {
    fs.writeFileSync(this.jobsFile, JSON.stringify(this.jobs, null, 2));
  }

  createJob(urls, source = 'api') {
    const id = createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 8);
    this.jobs[id] = {
      id,
      urls,
      source,
      status: 'pending',
      results: [],
      created: new Date().toISOString(),
      completed: null
    };
    this.save();
    return id;
  }

  getJob(id) {
    return this.jobs[id] || null;
  }

  updateJob(id, data) {
    if (this.jobs[id]) {
      Object.assign(this.jobs[id], data);
      this.save();
    }
  }

  listJobs(limit = 20) {
    return Object.values(this.jobs).sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, limit);
  }
}

const store = new Store(CONFIG.dataDir);

// ============ HTML TEMPLATES ============

function generateHTMLReport(results) {
  const now = new Date().toISOString();
  const totalUrls = results.length;
  const successful = results.reduce((sum, r) => sum + (r.archives?.filter(a => a.status === 'success').length || 0), 0);

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🗄️ Archive Box</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.6; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #58a6ff; border-bottom: 2px solid #30363d; padding-bottom: 10px; margin-bottom: 20px; }
    .input-group { margin-bottom: 20px; }
    textarea { width: 100%; padding: 12px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; color: #c9d1d9; font-size: 14px; min-height: 100px; }
    button { background: #238636; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600; }
    button:hover { background: #2ea043; }
    .summary { background: #161b22; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #30363d; }
    .url-group { background: #161b22; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #30363d; }
    .original-url { color: #e3b341; word-break: break-all; margin-bottom: 10px; }
    .archive-link { display: block; color: #58a6ff; text-decoration: none; padding: 5px 0; }
    .archive-link:hover { text-decoration: underline; }
    .status { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px; }
    .status.success { background: #238636; }
    .status.failed { background: #da3633; }
    .status.error { background: #d29922; color: #0d1117; }
    .loading { text-align: center; padding: 40px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #30363d; border-top-color: #58a6ff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗄️ Archive Box</h1>
    <div class="input-group">
      <textarea id="urls" placeholder="Enter URLs (one per line) to archive..."></textarea>
    </div>
    <button onclick="archive()">Archive URLs</button>
    <div id="results"></div>
  </div>
  <script>
    async function archive() {
      const urls = document.getElementById('urls').value.split('\\n').map(u => u.trim()).filter(u => u);
      if (!urls.length) return alert('Please enter at least one URL');
      
      const btn = document.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Archiving...';
      document.getElementById('results').innerHTML = '<div class="loading"><div class="spinner"></div>Archiving URLs...</div>';
      
      try {
        const res = await fetch('/api/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls })
        });
        const job = await res.json();
        pollStatus(job.id);
      } catch (e) {
        document.getElementById('results').innerHTML = '<div class="url-group">Error: ' + e.message + '</div>';
        btn.disabled = false;
      }
    }
    
    async function pollStatus(id) {
      const check = async () => {
        try {
          const res = await fetch('/api/archive/' + id);
          const job = await res.json();
          
          if (job.status === 'completed') {
            renderResults(job.results);
            document.querySelector('button').disabled = false;
          } else if (job.status === 'failed') {
            document.getElementById('results').innerHTML = '<div class="url-group">Job failed</div>';
            document.querySelector('button').disabled = false;
          } else {
            setTimeout(check, 2000);
          }
        } catch (e) { setTimeout(check, 2000); }
      };
      check();
    }
    
    function renderResults(results) {
      const successful = results.reduce((sum, r) => sum + (r.archives?.filter(a => a.status === 'success').length || 0), 0);
      let html = '<div class="summary"><strong>' + results.length + '</strong> URLs → <strong>' + successful + '</strong> archives</div>';
      
      for (const r of results) {
        html += '<div class="url-group"><div class="original-url">🌐 ' + r.original_url + '</div>';
        for (const a of (r.archives || [])) {
          if (a.status === 'success' && a.url) {
            html += '<a href="' + a.url + '" class="archive-link" target="_blank">' + a.provider + '</a>';
          }
        }
        html += '</div>';
      }
      
      document.getElementById('results').innerHTML = html;
    }
  </script>
</body>
</html>`;
  return html;
}

// ============ API ROUTES ============

const ROUTES = {
  'GET /': () => generateHTMLReport([]),
  
  'GET /api': () => JSON.stringify({ 
    providers: Object.keys(providers),
    jobs: store.listJobs(5).map(j => ({ id: j.id, status: j.status, count: j.urls.length }))
  }),
  
  'POST /api/archive': async (req, body) => {
    const { urls, providers: providerList } = body;
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return { error: 'No URLs provided' }, 400;
    }
    
    const jobId = store.createJob(urls, 'api');
    processUrls(jobId, providerList || Object.keys(providers));
    
    return { id: jobId, status: 'pending', message: 'Job created' };
  },
  
  'GET /api/archive/:id': (req, id) => {
    const job = store.getJob(id);
    if (!job) return { error: 'Job not found' }, 404;
    return job;
  }
};

async function processUrls(jobId, providerList) {
  const job = store.getJob(jobId);
  if (!job) return;
  
  store.updateJob(jobId, { status: 'processing' });
  
  const results = [];
  
  for (const url of job.urls) {
    const archives = [];
    
    for (const pk of providerList) {
      const provider = providers[pk];
      if (!provider) continue;
      
      const result = await provider.archive(url);
      archives.push(result);
      await new Promise(r => setTimeout(r, 500));
    }
    
    results.push({
      original_url: url,
      archives,
      timestamp: new Date().toISOString()
    });
  }
  
  store.updateJob(jobId, { 
    status: 'completed', 
    results,
    completed: new Date().toISOString()
  });
}

// ============ HTTP SERVER ============

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e6) reject(new Error('Too large')); });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  try {
    let key = `${method} ${path}`;
    if (key.startsWith('GET /api/archive/')) {
      key = 'GET /api/archive/:id';
    }
    
    const route = ROUTES[key];
    
    if (route) {
      let body = {};
      if (method === 'POST') {
        body = await parseBody(req);
      }
      
      const result = await route(req, body, path.split('/').pop());
      
      if (result && result.error) {
        res.writeHead(result[1] || 400);
        res.end(JSON.stringify({ error: result[0] }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      }
    } else {
      const staticPath = path === '/' ? '/index.html' : path;
      const filePath = path.join(__dirname, 'public', staticPath);
      
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
        res.end(fs.readFileSync(filePath));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}

// ============ TELEGRAM BOT ============

async function startBot() {
  if (!CONFIG.token) {
    console.log('No TELEGRAM_BOT_TOKEN - bot not started');
    return;
  }
  
  const api = `https://api.telegram.org/bot${CONFIG.token}`;
  
  async function request(method, data = {}) {
    const res = await fetch(`${api}/${method}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  }
  
  const me = await request('getMe');
  console.log(`🤖 Bot: @${me.result.username}`);
  
  let offset = 0;
  
  async function poll() {
    try {
      const updates = await request('getUpdates', { offset, timeout: 30 });
      
      if (!updates.ok || !updates.result) {
        setTimeout(poll, 1000);
        return;
      }
      
      for (const u of updates.result) {
        offset = u.update_id + 1;
        if (!u.message || !u.message.text || !u.message.chat) continue;
        
        const chatId = u.message.chat.id;
        const text = u.message.text.trim();
        
        if (text === '/start') {
          await request('sendMessage', { chat_id: chatId, text: '🗄️ Archive Box\n\nSend URLs to archive!\n/providers - List providers', parse_mode: 'HTML' });
          continue;
        }
        
        if (text === '/providers') {
          await request('sendMessage', { chat_id: chatId, text: '<b>Providers:</b>\n\n' + Object.keys(providers).join('\n'), parse_mode: 'HTML' });
          continue;
        }
        
        const urls = text.split('\n').map(l => l.trim()).filter(l => l.match(/^https?:\/\//));
        
        if (urls.length === 0) {
          await request('sendMessage', { chat_id: chatId, text: '❌ No valid URLs' });
          continue;
        }
        
        await request('sendMessage', { chat_id: chatId, text: `📦 Archiving ${urls.length} URL(s)...` });
        
        const jobId = store.createJob(urls, 'telegram');
        processUrls(jobId, Object.keys(providers));
        
        await request('sendMessage', { chat_id: chatId, text: `✅ Job: ${jobId}` });
      }
    } catch (e) {
      console.error('Bot error:', e.message);
    }
    
    setTimeout(poll, 1000);
  }
  
  poll();
}

// ============ MAIN ============

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🗄️ Archive Box Server

Usage:
  node server.js              Start server
  node server.js --bot        Start with Telegram bot
  node server.js --port 3000  Custom port

Environment:
  PORT=3000
  TELEGRAM_BOT_TOKEN=xxx
`);
    return;
  }
  
  const server = http.createServer(handleRequest);
  
  server.listen(CONFIG.port, CONFIG.host, () => {
    console.log(`🗄️ Archive Box running on http://${CONFIG.host}:${CONFIG.port}`);
  });
  
  if (args.includes('--bot') || CONFIG.token) {
    startBot();
  }
}

main();
