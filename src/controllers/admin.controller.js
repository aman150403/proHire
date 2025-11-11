import { Candidate } from "../models/candidate.model.js"
import { Job } from "../models/job.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import { Admin } from '../models/admin.model.js';
import { filterAndPaginate } from "../utils/filterAndPaginate.js";

async function loginAdmin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Both the fields are required',
            });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({
                success: false,
                message: 'Admin not found',
            });
        }

        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Credentials',
            });
        }

        const accessToken = await admin.generateAccessToken();

        const loggedInAdmin = await Admin.findById(admin._id).select('-password');

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .json({
                success: true,
                message: 'Admin logged in successfully',
                loggedInAdmin
            });

    } catch (error) {
        console.log('Admin login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error during admin login',
            error: error.message
        });
    }
}

async function getAllCandidates(req, res) {
    const result = filterAndPaginate({
        model: Candidate,
        query: req.query,
        searchableFields: [
            'fullName',
            'email',
            'phoneNo',
            'skills',
            'education',
            'experienceLevel',
            'location'
        ]
    })

    return res.status(res.success ? 200 : 500).json(result)
}

async function deleteCandidateById(req, res) {
    try {
        const candidateId = req.params.id;

        if (!candidateId) {
            return res.status(404).json({
                message: 'Candidate id is required',
                success: false
            })
        }

        const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);

        if (!deletedCandidate) {
            return res.status(404).jsos({
                message: 'Candidate not found',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Candidate deleted successfully',
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false
        })
    }
}

async function getAllRecruiters(req, res) {
    const result = filterAndPaginate({
        model: Recruiter,
        query: req.query,
        searchableFields: [
            'fullName',
            'email',
            'company'
        ]
    })

    return res.status(res.success ? 200:500).json(result)
}

async function deleteRecruiterById(req, res) {
    try {
        const recruiterId = req.params.id;

        if (!recruiterId) {
            return res.status(404).json({
                message: 'Recruiter Id is required',
                success: false
            })
        }

        const deletedRecruiter = await Recruiter.findByIdAndDelete(recruiterId);

        if (!deletedRecruiter) {
            return res.status(404).json({
                message: 'Recruiter not found',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Recruiter deleted successfully',
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function getAllJobsAdmin(req, res) {
    try {
        const jobs = await Job.find({});

        if (!jobs) {
            return res.status(404).json({
                message: 'Jobs not found',
                success: false
            })
        }

        const totalJobs = jobs.length;

        return res.status(200).json({
            success: true,
            message: 'All jobs fetched succeessfully',
            jobs,
            totalJobs
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function toggleJobStatus(req, res) {
    try {
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: 'Job ID is required',
                success: false
            });
        }

        // Find the job
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found',
                success: false
            });
        }

        // Toggle the status
        job.isActive = !job.isActive;

        await job.save();

        return res.status(200).json({
            message: `Job is now ${job.isActive ? 'active' : 'inactive'}`,
            success: true,
            job
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        });
    }
}

export {
    loginAdmin,
    getAllCandidates,
    deleteCandidateById,
    getAllRecruiters,
    deleteRecruiterById,
    getAllJobsAdmin,
    toggleJobStatus
}