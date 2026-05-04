const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');

// @desc    Get student grades
// @route   GET /api/student/grades
// @access  Private/Student
const getGrades = async (req, res) => {
    const marks = await Marks.find({ student: req.user._id }).populate('subject');
    res.json(marks);
};

// @desc    Get student attendance
// @route   GET /api/student/attendance
// @access  Private/Student
const getAttendance = async (req, res) => {
    const attendance = await Attendance.find({ student: req.user._id })
        .populate('subject')
        .populate('faculty', 'name')
        .sort('-date');
    res.json(attendance);
};

// @desc    Get student notices
// @route   GET /api/student/notices
// @access  Private/Student
const getNotices = async (req, res) => {
    const notices = await Announcement.find({ targetAudience: { $in: ['All', 'Student'] } }).sort('-createdAt');
    res.json(notices);
};

// @desc    Get student dashboard stats
// @route   GET /api/student/dashboard-stats
// @access  Private/Student
const getDashboardStats = async (req, res) => {
    try {
        const studentId = req.user._id;
        
        const totalClasses = await Attendance.countDocuments({ student: studentId });
        const attended = await Attendance.countDocuments({ student: studentId, status: 'Present' });
        
        const marks = await Marks.find({ student: studentId });
        let averageMarks = 0;
        if (marks.length > 0) {
            const sum = marks.reduce((acc, curr) => acc + (curr.marksObtained / curr.totalMarks) * 100, 0);
            averageMarks = Math.round(sum / marks.length);
        }

        const allMarks = await Marks.find({});
        let classAverage = 0;
        if (allMarks.length > 0) {
            const sumAll = allMarks.reduce((acc, curr) => acc + (curr.marksObtained / curr.totalMarks) * 100, 0);
            classAverage = Math.round(sumAll / allMarks.length);
        }

        res.json({ totalClasses, attended, averageMarks, classAverage });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getAvailableCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitEnrollment = async (req, res) => {
    try {
        const { courseId, academicYear } = req.body;
        
        await require('../models/User').findByIdAndUpdate(req.user._id, {
            course: courseId,
            academicYear: Number(academicYear) || 1,
            enrollmentStatus: 'Pending'
        });
        
        res.json({ message: 'Enrollment submitted successfully', enrollmentStatus: 'Pending', course: courseId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEnrollmentStatus = async (req, res) => {
    try {
        res.json({ 
            enrollmentStatus: req.user.enrollmentStatus, 
            course: req.user.course 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTimetable = async (req, res) => {
    try {
        const Subject = require('../models/Subject');
        if (!req.user.course) {
            return res.json([]);
        }
        const timetable = await Subject.find({ course: req.user.course })
            .populate('faculty', 'name')
            .sort('timing');
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getGrades, getAttendance, getNotices, getDashboardStats, getAvailableCourses, submitEnrollment, getEnrollmentStatus, getTimetable };
