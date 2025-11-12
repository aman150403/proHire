import mongoose from "mongoose";
import { Candidate } from "../models/candidate.model.js";
import { Job } from "../models/job.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js'

async function candidateRegistration(req, res) {
    try {
        const { fullName, email, password, phoneNo } = req.body;
        if (!fullName || !email || !password || !phoneNo) {
            return res.status(400).json({
                message: 'All the fields are required',
                status: 'unsuccessful'
            })
        }

        const userExists = await Candidate.findOne({ email })

        if (userExists) {
            return res.status(400).json({
                message: 'User already exists',
                status: 'unsuccessful'
            })
        }

        const newCandidate = await Candidate.create({
            fullName,
            email,
            password,
            phoneNo
        })

        if (!newCandidate) {
            return res.status(400).json({
                message: 'User not saved successfully',
                status: 'unsuccessful'
            })
        }

        return res.status(201).json({
            message: 'User saved successfully',
            newCandidate,
            status: true
        })

    } catch (error) {
        console.log('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error during candidate registration',
            error: error.message
        });
    }
}

async function candidateLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Both the fields are required',
            });
        }

        const candidate = await Candidate.findOne({ email });

        if (!candidate) {
            return res.status(400).json({
                success: false,
                message: 'Candidate not found',
            })
        }

        const isMatch = await candidate.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Credentials',
            })
        }

        const accessToken = await candidate.generateAccessToken();

        const loggedInUser = await Candidate.findOne({ email }).select('-password');

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .json({
                success: true,
                message: 'Candidate logged in successfully',
                loggedInUser
            })

    } catch (error) {
        console.log('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error during candidate login',
            error: error.message
        });
    }
}

async function candidateProfile(req, res) {
    try {
        const { id } = req.user;

        if (!id) {
            res.status(400).json({
                message: 'Candidate must be loggedin',
                success: false,
            })
        }

        const candidateProfile = await Candidate.findById(id).select('-password -accessToken');

        if (!candidateProfile) {
            res.status(400).json({
                message: 'Candidate not found',
                success: false,
            })
        }

        res.status(200).json({
            message: 'Candidate profile fetched successfully',
            success: true,
            candidateProfile
        })
    } catch (error) {
        res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function candidateLogout(req, res) {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Candidate not authenticated'
            });
        }

        await Candidate.findByIdAndUpdate(id, {
            $unset: { accessToken: "" }
        });

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie('accessToken', options)
            .json({
                success: true,
                message: 'Logged out successfully'
            });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
}

async function updateCandidateProfile(req, res) {
    try {
        const { id } = req.user;

        if (!id) {
            res.status(400).json({
                message: 'Candidate not loggedn',
                success: false
            })
        }

        const { passoutYear,
            experience,
            graduation,
            skills,
            portFolioLink,
            jobPreference } = req.body

        let profilePicture;

        const profilePicturePath = req.file?.path;
        if (profilePicturePath) {
            profilePicture = await uploadOnCloudinary(profilePicturePath);
        }

        const updateFields = {
            passoutYear,
            experience,
            graduation,
            skills,
            portFolioLink,
            jobPreference
        };

        if (profilePicture?.url) {
            updateFields.profilePicture = profilePicture.url || profilePicture;
        }

        const candidate = await Candidate.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password -accessToken');

        if (!candidate) {
            return res.status(404).json({
                message: 'Candidate not found',
                success: false
            });
        }

        return res.status(200).json({
            message: 'Candidate updated successfully',
            success: true,
            candidate
        });
    } catch (error) {
        res.status(500).json({
            message: 'Somethoong went wrong',
            success: false,
            error: error.message
        })
    }
}

async function uploadResume(req, res) {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(400).json({
                message: 'Candidate not loggedin',
                success: false
            })
        }

        const resumePath = req.file?.path;
        if (!resumePath) {
            return res.status(400).json({
                message: 'Resume is required',
                success: false
            })
        }

        const resume = await uploadOnCloudinary(resumePath);

        if (!resume) {
            return res.status(400).json({
                message: 'Resume is required',
                success: false
            })
        }

        const candidate = await Candidate.findByIdAndUpdate(id, {
            $set: {
                resume: resume.url
            }
        },
            {
                new: true,
                runValidators: true
            }
        ).select('-password -accessToken')

        if (!candidate) {
            return res.status(400).json({
                message: 'Candidate not found',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Resume uploaded successfully',
            success: true,
            candidate
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;

        const candidate = await Candidate.findById(req.user.id)

        const isPasswordCorrect = await candidate.comparePassword(oldPassword);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: 'Old passwrod is incorrect',
                success: false
            })
        }
        candidate.password = newPassword;
        await candidate.save({ validateBeforeSave: false })

        return res.status(200).json({
            message: 'Password changed successfully',
            success: true,
            candidate
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

async function deleteCandidateAccount(req, res) {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(400).json({
                message: 'Candidate not loggedIn',
                success: false
            })
        }

        const candidate = await Candidate.findByIdAndDelete(id)

        if (!candidate) {
            return res.status(400).json({
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
            success: false,
            error: error.message
        })
    }
}

async function applyToJob(req, res) {
    try {
        const { id: candidateId } = req.user;
        const { jobId } = req.params;

        // Validate jobId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: 'Invalid Job ID',
                success: false
            });
        }

        // Find job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: 'Job not found',
                success: false
            });
        }

        // Find candidate
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({
                message: 'Candidate not found',
                success: false
            });
        }

        // Check if candidate already applied
        const hasApplied = candidate.appliedJobs.some(
            (app) => app.jobId.toString() === jobId
        );
        if (hasApplied) {
            return res.status(400).json({
                message: 'You have already applied for this job',
                success: false
            });
        }

        // Add job to candidate's appliedJobs
        candidate.appliedJobs.push({
            jobId,
            appliedAt: new Date(),
            status: 'applied'
        });
        await candidate.save();

        // Add candidate to job's applicants
        job.applicants.push({
            candidateId,
            appliedAt: new Date(),
            status: 'applied'
        });
        await job.save();

        return res.status(200).json({
            message: 'Applied to job successfully',
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        });
    }
}

async function getAppliedJobs(req, res) {
    try {
        const { id } = req.user;

        const candidate = await Candidate.findById(id);
        if (!candidate) {
            return res.status(404).json({
                message: 'Candidate not found',
                success: false
            });
        }

        const jobs = await Candidate.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $unwind: '$appliedJobs'
            },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'appliedJobs.jobId',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            {
                $unwind: '$jobDetails'
            },
            {
                $project: {
                    jobId: '$appliedJobs.jobId',
                    status: '$appliedJobs.status',
                    appliedAt: '$appliedJobs.appliedAt',  
                    jobTitle: '$jobDetails.title',        
                    company: '$jobDetails.company',
                    location: '$jobDetails.location'
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: 'Applied jobs fetched successfully',
            count: jobs.length,
            jobs
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching applied jobs',
            error: error.message
        });
    }
}

export {
    candidateRegistration,
    candidateLogin,
    candidateProfile,
    candidateLogout,
    updateCandidateProfile,
    uploadResume,
    changePassword,
    applyToJob,
    getAppliedJobs, 
    deleteCandidateAccount
}
