import express from 'express';
import {
  getAllCandidates,
  deleteCandidateById,
  getAllRecruiters,
  deleteRecruiterById,
  getAllJobsAdmin,
  toggleJobStatus,
  loginAdmin
} from '../controllers/admin.controller.js';

import { verifyJwt } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';

const adminRouter = express.Router();

// Login route (no token required)
adminRouter.post('/login', loginAdmin);

// Protect all routes below
adminRouter.use(verifyJwt, checkRole('admin'));

// 👤 Candidate Management
adminRouter.get('/candidates', getAllCandidates);
adminRouter.delete('/candidates/:id', deleteCandidateById);

// 🧑‍💼 Recruiter Management
adminRouter.get('/recruiters', getAllRecruiters);
adminRouter.delete('/recruiters/:id', deleteRecruiterById);

// 💼 Job Management
adminRouter.get('/jobs', getAllJobsAdmin);
adminRouter.put('/jobs/:id/status', toggleJobStatus); // e.g. activate/deactivate job posting

export default adminRouter;
