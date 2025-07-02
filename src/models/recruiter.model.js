import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const recruiterSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        company: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true        
        },
        phoneNo: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
            minLength: 4
        },
        role: {
            type: String,
            default: 'recruiter',
            enum: ['recruiter', 'admin']
        },
        profilePicture: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
)

recruiterSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

recruiterSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            id: this._id,
            name: this.name,
            email: this.company,
            role: this.role,
            company: this.company
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

recruiterSchema.methods.comparePassword = async function (recruiterPassword){
    return await bcrypt.compare(recruiterPassword, this.password)
}

const Recruiter = model ('Recruiter', recruiterSchema);

export { Recruiter };