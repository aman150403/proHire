import { Job } from "../models/job.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import redisClient from "../utils/redis.js";

async function registerRecruiter(req, res) {
    try {
        const { name, email, password, company, phoneNo } = req.body;

        if (!name || !email || !password || !company || !phoneNo) {
            return res.status(400).json({
                message: 'All the fields are required',
                success: false
            })
        }

        const recruiterExists = await Recruiter.findOne({ email })

        if (recruiterExists) {
            return res.status(400).json({
                message: 'Recruiter already exists',
                succses: false
            })
        }

        const newRecruiter = await Recruiter.create({
            name,
            email,
            phoneNo,
            company,
            password
        })

        if (!newRecruiter) {
            return res.status(400).json({
                message: 'New recruiter could not be created',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Recruiter registered successfully',
            success: true,
            newRecruiter
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function loginRecruiter(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                success: false
            })
        }

        const recruiter = await Recruiter.findOne({ email })

        if (!recruiter) {
            return res.status(404).json({
                message: 'Recruiter not found',
                success: false
            })
        }

        const isMatch = await recruiter.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid  credentials',
                success: false
            })
        }

        const accessToken = await recruiter.generateAccessToken();

        if (!accessToken) {
            return res.status(400).json({
                message: 'Could not generate access token',
                success: false
            })
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .json({
                message: 'Recruiter loggedin successfully',
                success: true,
            })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function updateRecruiterProfile(req, res,) {
    try {
        const recruiterId = req.user.id;

        const forbiddenFields = ['name', 'email', 'company', 'phoneNo']

        for (const field of forbiddenFields) {
            if (field in req.body) {
                return res.status(403).json({
                    message: `${field} can not be updated once entered`,
                    success: false
                })
            }
        }

        const updateFields = {}

        if (req.body.bio) updateFields.bio = req.body.bio;
        if (req.body.designation) updateFields.designation = req.body.designation;

        const profilePicturePath = req.file?.path;
        if (profilePicturePath) {
            const uploaded = await uploadOnCloudinary(profilePicturePath);
            if (uploaded?.url) {
                updateFields.profilePicture = uploaded.url;
            }
        }

        const updatedRecruiter = await Recruiter.findByIdAndUpdate(
            recruiterId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedRecruiter) {
            return res.status(404).json({
                message: 'Recruiter not found',
                success: false,
            });
        }

        await redisClient.del(`recruiter_dashboard:{}{}`);
        console.log("CACHE INVALIDATED: recruiter_dashboard:{}{}");

        return res.status(200).json({
            message: 'Recruiter profile updated successfully',
            success: true,
            recruiter: updatedRecruiter,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function getRecruiterProfile(req, res) {
    try {
        const id = req.user?.id;

        const recruiter = await Recruiter.findById(id)

        if (!recruiter) {
            return res.status(404).json({
                message: 'Could not find the recruiter',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Recruiter profile fetched successfully',
            success: true,
            recruiter
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function deleteRecruiterAccount(req, res) {
    try {
        const id = req.user?.id;

        const recruiter = await Recruiter.findByIdAndDelete(id);

        if (!recruiter) {
            return res.status(400).json({
                message: 'Recruiter not found',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Recruiter profile deleted successfully',
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: 'SOmething went wromg',
            success: false,
            error: error.message
        })
    }
}

async function allJobsPosted(req, res) {
    try {
        const recruiterId = req.user?.id;

        const jobs = await Job.find({ postedBy: req.user.id }).select('title company location views');

        if (!jobs) {
            return res.status(400).json({
                message: 'Jobs not found',
                success: false
            })
        }

        return res.status(200).json({
            message: 'All jobs posted fetched successfully',
            success: true,
            jobs
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function logoutRecruiter(req, res) {
    try {
        const id = req.user?.id

        const recruiter = await Recruiter.findById(id)

        if (!recruiter) {
            return res.status(400).json({
                message: 'Recruiter not found',
                success: false
            })
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie('accessToken', options)
            .json({
                message: 'Recruiter loged out successfully',
                success: true
            })
    } catch (error) {
        return res.status(500).json({
            messsage: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function changeRecruiterPassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Both the fields are required',
                success: false
            })
        }

        const id = req.user?.id;

        const recruiter = await Recruiter.findById(id);

        if (!recruiter) {
            return res.status(400).json({
                message: 'Recruiter not found',
                success: false
            })
        }

        const compareOldPassword = recruiter.comparePassword(oldPassword);

        if (!compareOldPassword) {
            return res.status(400).json({
                message: 'Invalid old password',
                success: false
            })
        }

        recruiter.password = newPassword;
        recruiter.save()

        return res.status(200).json({
            message: 'Password updated successfully',
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function createJob(req, res) {
    try {
        const {
            company,
            title,
            location,
            description,
            jobType,
            mode,
            experienceLevel,
            salary,
            skills,
            expiryDate,
        } = req.body;

        if (!company || !title || !location || !description) {
            return res.status(400).json({
                success: false,
                message: 'company, title, location, and description are required',
            });
        }

        if (req.user?.role !== 'recruiter' && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only recruiters can post jobs',
            });
        }

        const newJob = await Job.create({
            company,
            title,
            location,
            description,
            jobType,
            mode,
            experienceLevel,
            salary,
            skills,
            expiryDate,
            postedBy: req.user.id,
        });

        return res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: newJob,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function updateJob(req, res) {
    try {
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: 'JobId is required',
                success: false
            })
        }

        const forbiddenFields = ['title', 'description', 'location'];
        for (const field of forbiddenFields) {
            if (field in req.body) {
                return res.status(400).json({
                    message: `${field} cannot be updated after job creation`,
                    success: false
                });
            }
        }

        const {
            jobType,
            mode,
            experienceLevel,
            salary,
            skills,
            isActive
        } = req.body;

        const jobUpdateFields = {};

        if (jobType) jobUpdateFields.jobType = jobType
        if (mode) jobUpdateFields.mode = mode
        if (experienceLevel) jobUpdateFields.experienceLevel = experienceLevel
        if (salary) jobUpdateFields.salary = salary
        if (skills) {
            jobUpdateFields.skills = Array.isArray(skills)
                ? skills.map(s => s.toLowerCase())
                : skills.split(',').map(s => s.toLowerCase())
        }
        if (typeof isActive === 'boolean') jobUpdateFields.isActive = isActive

        const updatedJob = await Job.findByIdAndUpdate(jobId, jobUpdateFields,
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedJob) {
            return res.status(400).json({
                message: 'Job not found',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Job updated successfully',
            success: true,
            updatedJob
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: true,
            error: error.message
        })
    }

}

async function deleteJob(req, res) {
    try {
        const jobId = req.params.id
        if (!jobId) {
            return res.status(400).json({
                message: 'Job Id is required',
                success: false
            })
        }

        const deletedJob = await Job.findByIdAndDelete(jobId)

        if (!deletedJob) {
            return res.status(400).json({
                message: 'Job not found',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Job deleted successfully',
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

async function getApplicantsForJob(req, res) {
    try {
        const recruiterId = req.user.id;
        const { id: jobId } = req.params;

        const jobApplicants = await Job.findOne({ _id: jobId, postedBy: recruiterId })
            .select('title applicants')
            .populate('applicants.candidateId', 'fullName email phoneNo resume profilePicture')

        if (!jobApplicants || jobApplicants.length == 0) {
            return res.status(400).json({
                message: 'There are no jobs posted by this recruiter',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Jobs found posted by this recruiter',
            succses: true,
            jobApplicants
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function updateApplicantStatus(req, res) {
    try {
        const { candidateId, jobId } = req.params;
        const { applicantStatus } = req.body;

        const allowedStatuses = ['applied', 'shortlisted', 'interviewed', 'offered', 'rejected'];

        if (!allowedStatuses.includes(applicantStatus)) {
            return res.status(404).json({
                meassage: 'Invalid status value',
                success: false
            })
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(400).json({
                message: 'Invalid job id',
                success: false
            })
        }

        const applicant = await job.applicants.find(app => app.candidateId.toString() === candidateId)

        if (!applicant) {
            return res.status(404).json({
                message: 'Candidate not found in applicants list',
                success: false
            });
        }

        applicant.status = status;
        await job.save();

        return res.status(200).json({
            message: 'Applicants successfully found',
            success: true,
            applicant
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.meassage
        })
    }
}

async function getRecruiterProfileWithDashboard(req, res) {
    try {
        const recruiterId = req.user.id;

        const recruiter = await Recruiter.findById(recruiterId).select('-password');

        if (!recruiter) {
            return res.status(404).json({
                message: 'Recruiter not found',
                success: false
            })
        }

        const jobs = await Job.find({ postedBy: recruiterId })
            .populate('applicant.candidateId', 'fullName email')
            .select('title company location views applicants')

        if (!jobs) {
            return res.status(404).json({
                meassage: 'Jobs not found posted by this recruiter',
                success: false
            })
        }

        const totalJobs = jobs.length;

        const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);

        const totalApplicants = jobs.reduce((sum, applicant) => sum + (job.applicants?.length || 0), 0)

        return res.status(200).json({
            message: 'Recruiter profile data fetched successfully',
            success: true,
            recruiter,
            stats: {
                totalJobs,
                totalApplicants,
                totalViews
            },
            jobs
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}


export {
    registerRecruiter,
    loginRecruiter,
    getRecruiterProfile,
    deleteRecruiterAccount,
    logoutRecruiter,
    allJobsPosted,
    createJob,
    updateJob,
    deleteJob,
    changeRecruiterPassword,
    getApplicantsForJob,
    updateApplicantStatus,
    getRecruiterProfileWithDashboard,
    updateRecruiterProfile
}


