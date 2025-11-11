import mongoose, { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const candidateSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
        },
        phoneNo: {
            type: String,
            required: true,
        },
        passoutYear: {
            type: Number
        },
        expirience: {
            type: Number
        },
        graduation: {
            type: String,
            trim: true,
            lowercase: true
        },
        skills: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        resume: {
            type: String
        },
        profilePicture: {
            type: String
        },
        portFolioLink: {
            type: String
        },
        jobPreference: {
            location: {
                type: String
            },
            role: {
                type: String,
                enum: ['fulltime', 'internship', 'parttime']
            },
            salaryExpected: {
                type: Number
            }
        },
        appliedJobs: [{
            jobId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Job',
            },
            appliedAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['applied', 'shortlisted', 'interviewed', 'offered', 'rejected'],
                default: 'applied'
            },
        }],
        role: {
            type: String,
            default: 'candidate'
        }
    },
    {
        timestamps: true
    }
)

candidateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


candidateSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id: this._id,
            fullName: this.fullName,
            email: this.email,
            role: this.role
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

candidateSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

const Candidate = model('Candidate', candidateSchema);

export { Candidate }