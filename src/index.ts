import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import NodeCache from 'node-cache';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

export const app = express();
const PORT = process.env.PORT || 3000;

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '60', 10);
const cache = new NodeCache({ stdTTL: CACHE_TTL });

app.use(express.json());
app.use(cors());

// Request ID & Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
  }));
  next();
});

// Rate Limiter
const auditRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.'
  }
});

const isValidUrl = (urlString: string): boolean => {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Audit API Endpoint
app.post('/api/audit', auditRateLimiter, async (req: Request, res: Response): Promise<any> => {
  const requestId = req.headers['x-request-id'] as string;
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !isValidUrl(url)) {
    return res.status(400).json({
      status: 'fail',
      requestId,
      message: 'Invalid URL provided. Must start with http:// or https://'
    });
  }

  const cachedData = cache.get(url);
  if (cachedData) {
    return res.status(200).json({
      status: 'success',
      requestId,
      cached: true,
      data: cachedData
    });
  }

  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'DigitalHeroes-PagePulse-Audit/1.0' }
    });

    const responseTimeMs = Date.now() - startTime;

    const auditData = {
      targetUrl: url,
      statusCode: response.status,
      responseTimeMs,
      sslValid: url.startsWith('https://'),
      headers: {
        contentType: response.headers['content-type'] || 'unknown',
        server: response.headers['server'] || 'unknown',
      },
      auditedAt: new Date().toISOString()
    };

    cache.set(url, auditData);

    return res.status(200).json({
      status: 'success',
      requestId,
      cached: false,
      data: auditData
    });

  } catch (error: any) {
    return res.status(502).json({
      status: 'error',
      requestId,
      message: 'Failed to fetch the target URL or request timed out.',
      details: error.message
    });
  }
});

// Mandatory Footer Credit Page
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Digital Heroes - Page Pulse API</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white; }
          .card { background: #1e293b; padding: 30px; border-radius: 12px; display: inline-block; }
          a { color: #38bdf8; text-decoration: none; font-weight: bold; }
          footer { margin-top: 40px; font-size: 14px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Page Pulse URL Audit API</h1>
          <p>Status: 🟢 Production Service Running</p>
          <p>Use <code>POST /api/audit</code> to run an audit.</p>
        </div>
        <footer>
          <p>Built for Digital Heroes Training Task - <a href="https://digitalheroesco.com" target="_blank">digitalheroesco.com</a></p>
        </footer>
      </body>
    </html>
  `);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
