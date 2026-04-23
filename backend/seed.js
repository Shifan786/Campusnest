const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Subject = require('./models/Subject');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Course.deleteMany();
        await Subject.deleteMany();

        // Users
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@college.edu',
            password: 'password123',
            role: 'Admin'
        });

        const faculty = await User.create({
            name: 'Dr. Jane Smith',
            email: 'faculty@college.edu',
            password: 'password123',
            role: 'Faculty',
            employeeId: 'EMP1001',
            department: 'Computer Science'
        });

        const student = await User.create({
            name: 'John Doe',
            email: 'student@college.edu',
            password: 'password123',
            role: 'Student',
            enrollmentNumber: 'ENR2023001',
            department: 'Computer Science'
        });

        // Course
        const btech = await Course.create({
            name: 'Bca',
            description: 'Bachelor of Computer Application',
            duration: '4 Years'
        });

        // Subject
        await Subject.create({
            name: 'Data Structures',
            code: 'CS201',
            course: btech._id,
            faculty: faculty._id,
            semester: 3
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
