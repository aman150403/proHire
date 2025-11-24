import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const adminSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'admin'
        }
    },
    {
        timestamps: true
    }
)

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

adminSchema.methods.comparePassword = async function (adminPassword) {
    return await bcrypt.compare(adminPassword, this.password)
}

adminSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            id: this._id,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY, 
        }
    );
}

const Admin = model('Admin', adminSchema)

export { Admin }