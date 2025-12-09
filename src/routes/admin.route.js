import express from 'express';
import {
  registerAdmin,
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
import { cache } from '../middlewares/cache.middleware.js';

const adminRouter = express.Router();

// Register and Login route (no token required)

adminRouter.post("/register", registerAdmin);
adminRouter.post('/login', loginAdmin);

// Protect all routes below
adminRouter.use(verifyJwt, checkRole('admin'));

// 👤 Candidate Management
adminRouter.get('/candidates', cache('admin:all-candidates:', 60), getAllCandidates);
adminRouter.delete('/candidates/:id', deleteCandidateById);

// 🧑‍💼 Recruiter Management
adminRouter.get('/recruiters', cache('admin:all-recruiters:', 60), getAllRecruiters);
adminRouter.delete('/recruiters/:id', deleteRecruiterById);

// 💼 Job Management
adminRouter.get('/jobs', cache('admin:all-jobs:', 60), getAllJobsAdmin);
adminRouter.put('/jobs/:id/status', toggleJobStatus); // e.g. activate/deactivate job posting

export default adminRouter;
