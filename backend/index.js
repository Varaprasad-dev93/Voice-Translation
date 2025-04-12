import express from 'express';
import convertRoute from './convert.js';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api', convertRoute);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
