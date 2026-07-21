// Vercel serverless entry point.
// Exports the Express app without calling app.listen() — Vercel manages the port.
// Local development uses src/index.ts which starts the server normally.
import app from '../src/app';

export default app;
