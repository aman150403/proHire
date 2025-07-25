import { Job } from "../models/job.model.js";

async function getAllJobs(req, res) {
    const { jobType, location, skills } = req.body;

    const query = {
        isActive: true
    }

    if (jobType) query.jobType = jobType.toLowerCase()
    if (location) query.location = location

    if (skills) {
        const skillsArray = Array.isArray(skills) ? skills
            : skills.split(',').map((skill) => skill.trim().toLowerCase())

        query.skills = { $in: skillsArray }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * 10;

    const totalJobs = await Job.countDocuments(query);

    const jobs = await Job.find(query)
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    return res.status(200).json({
        success: true,
        page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs,
        count: jobs.length,
        jobs,
    });

}

async function getJobById(req, res) {
    try {
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: 'Job Id is required',
                success: false
            })
        }

        const job = await Job.findById(jobId)

        if (!job) {
            return res.status(400).json({
                message: 'Job not found',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Job found successfully',
            success: true,
            job
        })
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong',
            success: false,
            error: error.message
        })
    }
}

export {
    getAllJobs,
    getJobById
}