const express = require('express');
const path = require('path');

const { analyzeImotiUrl } = require('./services/imotiAnalyzeService');

const app = express();
app.disable('x-powered-by');

app.use(express.json({ limit: '32kb' }));

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

// SPA-like fallback: serve index for unknown routes (but keep API 404s)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

const port = process.env.PORT ? Number(process.env.PORT) : 5173;
app.listen(port, () => {
  console.log(`Netita Properties running on http://localhost:${port}`);
  console.log('API: POST /api/imoti/analyze');
});
