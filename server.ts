import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import joinCourseHandler from './api/join-course';
import getAnswersHandler from './api/get-answers';
import chargeWalletHandler from './api/charge-wallet';
import submitExamHandler from './api/submit-exam';
import getLeaderboardHandler from './api/get-leaderboard';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/join-course', (req, res) => joinCourseHandler(req, res));
app.post('/api/get-answers', (req, res) => getAnswersHandler(req, res));
app.post('/api/charge-wallet', (req, res) => chargeWalletHandler(req, res));
app.post('/api/submit-exam', (req, res) => submitExamHandler(req, res));
app.get('/api/get-leaderboard', (req, res) => getLeaderboardHandler(req, res));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
