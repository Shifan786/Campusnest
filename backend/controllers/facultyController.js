const Subject = require('../models/Subject');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');

// @desc    Get subjects assigned to faculty
// @route   GET /api/faculty/subjects
// @access  Private
const getAssignedSubjects = async (req, res) => {
    try {
        // Find subjects where faculty matches current user
        const subjects = await Subject.find({ faculty: req.user._id }).populate('course', 'name description duration');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students in a specific course
// @route   GET /api/faculty/students/:courseId
// @access  Private
const getStudentsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const students = await User.find({ role: 'Student', course: courseId, enrollmentStatus: 'Approved' });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark attendance for a student
// @route   POST /api/faculty/attendance
// @access  Private
const markAttendance = async (req, res) => {
    try {
        const { studentId, subjectId, date, status } = req.body;
        
        let att = await Attendance.findOne({ student: studentId, subject: subjectId, date: new Date(date) });
        if (att) {
            att.status = status;
            att.faculty = req.user._id;
            await att.save();
        } else {
            att = await Attendance.create({
                student: studentId,
                subject: subjectId,
                faculty: req.user._id,
                date: new Date(date),
                status
            });
        }
        res.status(201).json(att);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload marks for a student
// @route   POST /api/faculty/marks
// @access  Private
const uploadMarks = async (req, res) => {
    try {
        const { studentId, subjectId, examName, marksObtained, totalMarks } = req.body;
        const marks = await Marks.create({
            student: studentId,
            subject: subjectId,
            faculty: req.user._id,
            examName,
            marksObtained,
            totalMarks
        });
        res.status(201).json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark bulk attendance
// @route   POST /api/faculty/attendance/bulk
// @access  Private
const markBulkAttendance = async (req, res) => {
    try {
        const { subjectId, date, records } = req.body;
        
        const promises = records.map(async (record) => {
            let att = await Attendance.findOne({
                student: record.studentId,
                subject: subjectId,
                date: new Date(date)
            });

            if (att) {
                att.status = record.status;
                att.faculty = req.user._id;
                await att.save();
            } else {
                await Attendance.create({
                    student: record.studentId,
                    subject: subjectId,
                    faculty: req.user._id,
                    date: new Date(date),
                    status: record.status
                });
            }
        });

        await Promise.all(promises);
        res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const facultyId = req.user._id;
        const Subject = require('../models/Subject');
        const assignedSubjects = await Subject.countDocuments({ faculty: facultyId });
        
        const User = require('../models/User');
        const totalStudents = await User.countDocuments({ role: 'Student' });

        res.json({ assignedSubjects, totalStudents, classesConducted: 12, pendingMarks: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNotices = async (req, res) => {
    try {
        const notices = await Announcement.find({ targetAudience: { $in: ['All', 'Faculty'] } }).sort('-createdAt');
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAvailableSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ $or: [{ faculty: null }, { faculty: { $exists: false } }] }).populate('course', 'name description');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const claimSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        if (subject.faculty) {
            return res.status(400).json({ message: 'Subject is already assigned to a faculty' });
        }
        
        subject.faculty = req.user._id;
        await subject.save();
        res.json({ message: 'Subject claimed successfully', subject });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSubject = async (req, res) => {
    try {
        const { name, code, course, semester } = req.body;
        const subject = new Subject({ 
            name, 
            code, 
            course, 
            faculty: req.user._id, 
            semester 
        });
        const createdSubject = await subject.save();
        res.status(201).json(createdSubject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAssignedSubjects, getStudentsByCourse, markAttendance, uploadMarks, markBulkAttendance, getDashboardStats, getNotices, getAvailableSubjects, claimSubject, getCourses, createSubject };
