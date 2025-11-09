import 'dotenv/config'; // Load .env file FIRST
import express from 'express';
import cors from 'cors';
import plantAgentRouter from './src/api/vertex/plant-agent';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware - Allow all origins in development
app.use(cors({
  origin: true, // Allow all origins for development/demo
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/vertex/plant-agent', plantAgentRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Unknown error',
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 PlantPal API server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 Plant Agent: http://localhost:${PORT}/api/vertex/plant-agent`);
    console.log(`\n✅ Environment loaded:`);
    console.log(`   GCP_PROJECT_ID: ${process.env.GCP_PROJECT_ID || 'NOT SET'}`);
    console.log(`   FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID || 'NOT SET'}`);
    console.log(`   GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET'}`);
  });
}

export default app;

