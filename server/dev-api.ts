import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();

// Parse JSON with larger limit for base64 images
app.use(bodyParser.json({ limit: '10mb' }));

// In-memory session storage (sessionId → base64 dataUrl)
const sessionImages = new Map<string, string>();

// POST /api/session/:id/image - Store image for a session
app.post('/api/session/:id/image', (req: Request, res: Response) => {
  const { id } = req.params;
  const { dataUrl } = req.body || {};

  if (!dataUrl || typeof dataUrl !== 'string') {
    return res.status(400).json({ error: 'dataUrl required' });
  }

  sessionImages.set(id, dataUrl);
  res.json({ ok: true });
});

// GET /api/session/:id/image - Retrieve image for a session
app.get('/api/session/:id/image', (req: Request, res: Response) => {
  const { id } = req.params;
  const dataUrl = sessionImages.get(id);

  if (!dataUrl) {
    return res.json({ found: false });
  }

  res.json({ found: true, dataUrl });
});

// DELETE /api/session/:id - Clear session
app.delete('/api/session/:id', (req: Request, res: Response) => {
  sessionImages.delete(req.params.id);
  res.json({ ok: true });
});

export default app;

