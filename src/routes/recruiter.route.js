import express from 'express';
import {
  registerRecruiter,
  loginRecruiter,
  logoutRecruiter,
  getRecruiterProfile,
  updateRecruiterProfile,
  changeRecruiterPassword,
  deleteRecruiterAccount,
  createJob,
  updateJob,
  deleteJob,
  getApplicantsForJob,
  updateApplicantStatus,
  getRecruiterProfileWithDashboard
} from '../controllers/recruiter.controller.js';

import { verifyJwt } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { cache } from '../middlewares/cache.middleware.js';

const recruiterRouter = express.Router();

recruiterRouter.post('/signup', registerRecruiter);
recruiterRouter.post('/login', loginRecruiter);
recruiterRouter.post('/logout', verifyJwt, checkRole('recruiter', 'admin'), logoutRecruiter);
recruiterRouter.get('/profile', verifyJwt, checkRole('recruiter', 'admin'), getRecruiterProfile);
recruiterRouter.put('/profile', verifyJwt, checkRole('recruiter', 'admin'), upload.single('profilePicture'), updateRecruiterProfile);
recruiterRouter.put('/profile/changepassword', verifyJwt, checkRole('recruiter', 'admin'), changeRecruiterPassword);
recruiterRouter.delete('/profile', verifyJwt, checkRole('recruiter', 'admin'), deleteRecruiterAccount);
recruiterRouter.get('/profile/dashboard', verifyJwt, checkRole('recruiter', 'admin'), cache('recruiter_dashboard:', 90), getRecruiterProfileWithDashboard);

recruiterRouter.post('/jobs', verifyJwt, checkRole('recruiter', 'admin'), createJob);
recruiterRouter.put('/jobs/:id', verifyJwt, checkRole('recruiter', 'admin'), updateJob);
recruiterRouter.delete('/jobs/:id', verifyJwt, checkRole('recruiter', 'admin'), deleteJob);
recruiterRouter.get('/jobs/:id/applicants', verifyJwt, checkRole('recruiter', 'admin'), getApplicantsForJob);
recruiterRouter.put('/jobs/:jobId/applicants/:candidateId', verifyJwt, checkRole('recruiter', 'admin'), updateApplicantStatus);

export default recruiterRouter;
