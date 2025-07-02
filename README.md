# 🧠 ProHire – Recruitment Platform Backend

**ProHire** is a recruitment platform that connects **candidates**, **recruiters**, and **administrators** via a role-based job posting and application system. Built with **Node.js**, **Express**, and **MongoDB**, it includes secure authentication, role-based access, job management, and filtering/pagination.

---

## 🚀 Features

- ✅ Role-based authentication (Candidate, Recruiter, Admin)
- 🔐 JWT-based secure login & access control
- 📂 Resume and profile picture upload via Multer & Cloudinary
- 📝 CRUD operations on Jobs (Create, Update, Delete, View)
- 👨‍💻 Candidate can apply to jobs, view applied jobs
- 🧑‍💼 Recruiter can manage jobs, view applicants, update application status
- 📊 Admin dashboard to manage users & jobs
- 🔍 Filtering & Pagination on GET requests
- ⚡ Rate limiting, middleware-based architecture

---

## 🏗️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT, Bcrypt
- **Middleware**: Multer, Cloudinary, Morgan, CORS
- **Utilities**: dotenv, custom filter/pagination functions
- **Security**: API rate limiting, cookie-based token management

---

## 📁 Folder Structure

src/
├── controllers/ # All route logic (candidate, recruiter, admin)
├── db/ # DB connection
├── middlewares/ # Auth, role-check, multer, rateLimiter
├── models/ # Mongoose schemas
├── routes/ # Route files
├── utils/ # Utility functions (e.g., filterAndPaginate)
├── app.js # Express app setup
├── index.js # Server entry point
