import mongoose, { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    company: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: true,
      lowercase: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
    },
    applicants: [
      {
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["applied", "shortlisted", "interviewed", "offered", "rejected"],
          default: "applied",
        },
      },
    ],
    description: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "internship"],
      default: "full-time",
    },
    mode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      default: "onsite",
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "mid-level", "senior"],
      default: "fresher",
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
    },
    skills: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Job = model("Job", jobSchema);

export { Job };
