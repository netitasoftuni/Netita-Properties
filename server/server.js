const express = require('express');
const path = require('path');

const { analyzeImotiUrl } = require('./services/imotiAnalyzeService');
const { computePropertiesAnalytics } = require('./util/propertiesAnalytics');
const {
  ensureStoreInitialized,
  readAll,
  writeAll,
  nextId,
  validateCreate,
  applyPatch
} = require('./data/propertiesStore');

const app = express();
app.disable('x-powered-by');

app.use(express.json({ limit: '32kb' }));

function decodeBasicAuth(headerValue) {
  if (typeof headerValue !== 'string') return null;
  const parts = headerValue.split(' ');
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const token = parts[1];
  if (scheme.toLowerCase() !== 'basic') return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    if (idx === -1) return null;
    return {
      user: decoded.slice(0, idx),
      pass: decoded.slice(idx + 1)
    };
  } catch (e) {
    return null;
  }
}

function isAdminAuthEnabled() {
  return Boolean(process.env.ADMIN_USER) && Boolean(process.env.ADMIN_PASS);
}

function requireAdminAuth(req, res, next) {
  if (!isAdminAuthEnabled()) return next();

  const creds = decodeBasicAuth(req.headers.authorization);
  const ok = creds && creds.user === process.env.ADMIN_USER && creds.pass === process.env.ADMIN_PASS;
  if (ok) return next();

  res.setHeader('WWW-Authenticate', 'Basic realm="Netita Admin"');

  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Admin authentication required' }
    });
  }

  return res.status(401).send('Admin authentication required');
}

function shouldProtectRequest(req) {
  if (req.path === '/admin.html') return true;
  if (req.path === '/js/admin.js') return true;

  if (req.path === '/api/properties' && req.method === 'POST') return true;
  if (req.path.startsWith('/api/properties/') && (req.method === 'PATCH' || req.method === 'DELETE')) return true;

  return false;
}

app.use((req, res, next) => {
  if (!shouldProtectRequest(req)) return next();
  return requireAdminAuth(req, res, next);
});

// Serve the existing static site
const staticRoot = path.join(__dirname, '..');
app.use(express.static(staticRoot));

app.post('/api/imoti/analyze', async (req, res) => {
  try {
    const { url } = req.body || {};

    const result = await analyzeImotiUrl({ url });
    res.status(200).json(result);
  } catch (error) {
    const status = typeof error?.status === 'number' ? error.status : 400;
    const code = error?.code || 'ANALYZE_FAILED';
    const message = error?.message || 'Failed to analyze URL';

    res.status(status).json({
      error: { code, message }
    });
  }
});

app.get('/api/analytics/properties', async (req, res) => {
  try {
    const properties = await readAll();
    const analytics = computePropertiesAnalytics(properties);
    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      analytics
    });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'ANALYTICS_FAILED', message: 'Failed to compute analytics' }
    });
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    const properties = await readAll();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({
      error: { code: 'STORE_READ_FAILED', message: 'Failed to read properties store' }
    });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'Property id must be a number' }
      });
    }

    const properties = await readAll();
    const property = properties.find((item) => item.id === id);
    if (!property) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Property not found' }
      });
    }

    return res.status(200).json(property);
  } catch (error) {
    return res.status(500).json({
      error: { code: 'STORE_READ_FAILED', message: 'Failed to read properties store' }
    });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const validation = validateCreate(req.body);
    if (!validation.ok) {
      return res.status(400).json({
        error: { code: 'VALIDATION_FAILED', message: validation.errors.join('; ') }
      });
    }

    const properties = await readAll();
    const created = {
      id: nextId(properties),
      ...validation.value
    };

    properties.push(created);
    await writeAll(properties);

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({
      error: { code: 'STORE_WRITE_FAILED', message: 'Failed to save property' }
    });
  }
});

app.patch('/api/properties/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'Property id must be a number' }
      });
    }

    const properties = await readAll();
    const index = properties.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Property not found' }
      });
    }

    const updated = applyPatch(properties[index], req.body);
    properties[index] = updated;
    await writeAll(properties);

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({
      error: { code: 'STORE_WRITE_FAILED', message: 'Failed to update property' }
    });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'Property id must be a number' }
      });
    }

    const properties = await readAll();
    const index = properties.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Property not found' }
      });
    }

    const deleted = properties.splice(index, 1)[0];
    await writeAll(properties);
    return res.status(200).json(deleted);
  } catch (error) {
    return res.status(500).json({
      error: { code: 'STORE_WRITE_FAILED', message: 'Failed to delete property' }
    });
  }
});

// SPA-like fallback: serve index for unknown routes (but keep API 404s)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'API route not found' }
    });
  }

  res.sendFile(path.join(staticRoot, 'index.html'));
});

function startServer(preferredPort) {
  const maxAttempts = 10;
  const basePort = Number.isFinite(preferredPort) ? preferredPort : 5173;

  const tryListen = (port, attempt) => {
    const server = app.listen(port, async () => {
      try {
        await ensureStoreInitialized();
      } catch (e) {
        console.warn('Warning: could not initialize properties store');
      }

      console.log(`Netita Properties running on http://localhost:${port}`);
      console.log('API: POST /api/imoti/analyze');
      console.log('API: GET /api/analytics/properties');
      console.log('API: GET /api/properties');
      console.log('API: GET /api/properties/:id');
      console.log('API: POST /api/properties');
      console.log('API: PATCH /api/properties/:id');
      console.log('API: DELETE /api/properties/:id');
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && attempt < maxAttempts) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is in use; retrying on ${nextPort}...`);
        try {
          server.close();
        } catch (e) {
          // ignore
        }
        tryListen(nextPort, attempt + 1);
        return;
      }

      throw err;
    });
  };

  tryListen(basePort, 1);
}

const port = process.env.PORT ? Number(process.env.PORT) : 5173;
startServer(port);
