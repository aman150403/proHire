import { Job } from "../models/job.model.js";

async function getAllJobs(req, res) {
    try {
        const { jobType, location, skills } = req.body;

        const query = { isActive: true };

        // Case-insensitive regex for jobType and location
        if (jobType) query.jobType = { $regex: jobType, $options: "i" };
        if (location) query.location = { $regex: location, $options: "i" };

        if (skills) {
            const skillsArray = Array.isArray(skills)
                ? skills
                : skills.split(',').map((skill) => skill.trim().toLowerCase());

            // Match any skill (case-insensitive)
            query.skills = { $in: skillsArray.map(skill => new RegExp(skill, "i")) };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalJobs = await Job.countDocuments(query);
        const jobs = await Job.find(query)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(totalJobs / limit),
            totalJobs,
            count: jobs.length,
            jobs,
        });

    } catch (error) {
        console.error("Error in getAllJobs:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
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