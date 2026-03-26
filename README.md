# College ERP MERN Application

A full-stack College ERP web app built using React, Node.js, Express, and MongoDB. 
It features role-based access for Admins, Faculty, and Students with a modern Tailwind CSS design.

## Features
- **Admin**: Manage users, courses, subjects, announcements.
- **Faculty**: View assigned classes, mark attendance, upload grades.
- **Student**: View personal dashboard, attendance percentage, and notices.

## Prerequisites
- Node.js (v18+)
- Local MongoDB running on `mongodb://127.0.0.1:27017`

## Installation

### 1. Backend Setup
```bash
cd backend
# Install dependencies
npm install

# Seed the database (Important! Sets up initial admin/users)
node seed.js    

# Start the server (runs on port 5000)
node server.js
```

### 2. Frontend Setup
Open a new terminal.
```bash
cd frontend
# Install dependencies
npm install

# Start the dev server
npm run dev
```

## Sample Accounts
**Use these credentials to test the various dashboards. Password for all is `password123`.**

- **Admin Account**: `admin@college.edu`
- **Faculty Account**: `faculty@college.edu`
- **Student Account**: `student@college.edu`
