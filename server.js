const express = require('express');
const path    = require('path');
const https   = require('https');
const app     = express();
const PORT    = process.env.PORT || 3000;

// URL del Apps Script — también configurable por variable de entorno
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwK8_P46dKeETc_d1W63ozTnM2VSx6Xu7yFCkbXnfsfc8ncLlGINObJlPFo8X-dcbRueA/exec';

// ── Proxy endpoint: el navegador llama a /api/data,
//    Railway llama a Apps Script (sin restricción CORS) ──
app.get('/api/data', (req, res) => {
  const sheet = req.query.sheet || 'all';
  const url   = `${APPS_SCRIPT_URL}?sheet=${sheet}&_=${Date.now()}`;

  console.log(`[proxy] → ${url}`);

  // seguir redirects manualmente (Apps Script redirige 302 → destino final)
  function fetchWithRedirects(targetUrl, redirects) {
    if (redirects > 5) {
      res.status(500).json({ ok: false, error: 'Demasiados redirects' });
      return;
    }
    https.get(targetUrl, { headers: { 'User-Agent': 'ImpulsoLabDashboard/1.0' } }, (appsRes) => {
      // Seguir redirect
      if ([301, 302, 303, 307, 308].includes(appsRes.statusCode)) {
        const location = appsRes.headers.location;
        console.log(`[proxy] redirect ${appsRes.statusCode} → ${location}`);
        appsRes.resume();
        fetchWithRedirects(location, redirects + 1);
        return;
      }

      let body = '';
      appsRes.setEncoding('utf8');
      appsRes.on('data', chunk => { body += chunk; });
      appsRes.on('end', () => {
        try {
          const json = JSON.parse(body);
          res.set('Cache-Control', 'no-store');
          res.json(json);
        } catch (e) {
          console.error('[proxy] JSON parse error:', body.substring(0, 200));
          res.status(500).json({ ok: false, error: 'Respuesta inválida del Apps Script', raw: body.substring(0, 300) });
        }
      });
    }).on('error', (e) => {
      console.error('[proxy] request error:', e.message);
      res.status(500).json({ ok: false, error: e.message });
    });
  }

  fetchWithRedirects(url, 0);
});

// ── Health check para Railway ──
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Archivos estáticos ──
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`✓ Impulso Lab Dashboard en puerto ${PORT}`));