const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');

// @desc    Get all users (students, faculty)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const roles = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(roles).select('-password');
    res.json(users);
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'Student' });
        const totalFaculty = await User.countDocuments({ role: 'Faculty' });
        const totalCourses = await Course.countDocuments();

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const enrollmentData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
            const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            
            const count = await User.countDocuments({ 
                role: 'Student', 
                createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
            });
            enrollmentData.push({ name: months[d.getMonth()], students: count });
        }
        
        if (enrollmentData.every(d => d.students === 0) && totalStudents > 0) {
            enrollmentData[5].students = totalStudents;
        }

        const subjects = await Subject.find().limit(5);
        const attendanceData = await Promise.all(subjects.map(async sub => {
            const total = await Attendance.countDocuments({ subject: sub._id });
            const present = await Attendance.countDocuments({ subject: sub._id, status: 'Present' });
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;
            return { name: sub.code || sub.name.substring(0,6), rate };
        }));

        res.json({ totalStudents, totalFaculty, totalCourses, enrollmentData, attendanceData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/admin/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    const { name, description, duration } = req.body;
    const course = new Course({ name, description, duration });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
const getCourses = async (req, res) => {
    const courses = await Course.find({});
    res.json(courses);
};

// @desc    Create a subject
// @route   POST /api/admin/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    const { name, code, course, faculty, semester } = req.body;
    const subject = new Subject({ name, code, course, faculty, semester });
    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
};

// @desc    Create an announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    const { title, content, targetAudience } = req.body;
    const announcement = new Announcement({
        title,
        content,
        author: req.user._id,
        targetAudience
    });
    const createdAnnouncement = await announcement.save();
    res.status(201).json(createdAnnouncement);
};

const getNotices = async (req, res) => {
    try {
        const notices = await Announcement.find({}).sort('-createdAt');
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAnnouncement = async (req, res) => {
    try {
        const { title, content, targetAudience } = req.body;
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id, 
            { title, content, targetAudience }, 
            { new: true }
        );
        if (!announcement) return res.status(404).json({ message: 'Notice not found' });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Notice not found' });
        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingEnrollments = async (req, res) => {
    try {
        const enrollments = await User.find({ role: 'Student', enrollmentStatus: 'Pending', course: { $exists: true } }).populate('course');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveEnrollment = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { enrollmentStatus: 'Approved' }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Enrollment approved', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectEnrollment = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { 
            enrollmentStatus: 'Rejected',
            $unset: { course: 1 } 
        }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Enrollment rejected', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    deleteUser,
    getSystemStats,
    createCourse,
    getCourses,
    createSubject,
    createAnnouncement,
    getNotices,
    updateAnnouncement,
    deleteAnnouncement,
    getPendingEnrollments,
    approveEnrollment,
    rejectEnrollment
};
