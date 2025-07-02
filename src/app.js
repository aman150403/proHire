import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';

import candidateRouter from './routes/candidate.route.js';
import recruiterRouter from './routes/recruiter.route.js';
import jobRouter from './routes/job.route.js';
import adminRouter from './routes/admin.route.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(apiRateLimiter);

app.use('/api/candidate', candidateRouter);
app.use('/api/recruiter', recruiterRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'ProHire API is up and running 🚀' });
});

export { app };
