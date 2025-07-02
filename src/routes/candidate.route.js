import express from 'express';
import {
  candidateRegistration,
  candidateLogin,
  candidateLogout,
  candidateProfile,
  updateCandidateProfile,
  uploadResume,
  changePassword,
  applyToJob,
  getAppliedJobs,
  deleteCandidateAccount
} from '../controllers/candidate.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const candidateRouter = express.Router();

candidateRouter.post('/signup', candidateRegistration);
candidateRouter.post('/login', candidateLogin);
candidateRouter.post('/logout', verifyJwt, checkRole('candidate'), candidateLogout);
candidateRouter.get('/profile', verifyJwt, checkRole('candidate'), candidateProfile);
candidateRouter.put('/profile', verifyJwt, checkRole('candidate'), upload.single('profilePicture'), updateCandidateProfile);
candidateRouter.put('/profile/resume', verifyJwt, checkRole('candidate'), upload.single('resume'), uploadResume);
candidateRouter.put('/profile/changepassword', verifyJwt, checkRole('candidate'), changePassword);
candidateRouter.delete('/profile', verifyJwt, checkRole('candidate'), deleteCandidateAccount);
candidateRouter.post('/apply/:jobId', verifyJwt, checkRole('candidate'), applyToJob);
candidateRouter.get('/applied-jobs', verifyJwt, checkRole('candidate'), getAppliedJobs);

export default candidateRouter;