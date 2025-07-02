import express from 'express';
import { getAllJobs, getJobById } from '../controllers/job.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';

const jobRouter = express.Router();

jobRouter.get('/', verifyJwt, checkRole('candidate', 'recruiter', 'admin'), getAllJobs);
jobRouter.get('/:id', verifyJwt, checkRole('candidate', 'recruiter', 'admin'), getJobById);

export default jobRouter;