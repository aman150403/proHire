import express from 'express';
import { getAllJobs, getJobById } from '../controllers/job.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';
import { cache } from '../middlewares/cache.middleware.js';

const jobRouter = express.Router();

jobRouter.get('/', verifyJwt, checkRole('candidate', 'recruiter', 'admin'), cache('all_jobs:', 60), getAllJobs);
jobRouter.get('/:id', verifyJwt, checkRole('candidate', 'recruiter', 'admin'), cache('job_description:', 240), getJobById);

export default jobRouter;