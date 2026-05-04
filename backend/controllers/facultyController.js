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
        const { studentId, subjectId, examName, semester, marksObtained, totalMarks, isAbsent } = req.body;

        if (!isAbsent && Number(marksObtained) > Number(totalMarks)) {
            return res.status(400).json({ message: 'Marks obtained cannot be greater than total marks' });
        }

        let existingMarks = await Marks.findOne({
            student: studentId,
            subject: subjectId,
            examName: examName,
            semester: semester
        });

        if (existingMarks) {
            if (!existingMarks.isAbsent) {
                return res.status(400).json({ message: 'Marks for this exam have already been uploaded for this student.' });
            } else {
                existingMarks.marksObtained = isAbsent ? 0 : Number(marksObtained);
                existingMarks.totalMarks = Number(totalMarks) || existingMarks.totalMarks;
                existingMarks.isAbsent = isAbsent || false;
                existingMarks.faculty = req.user._id;
                existingMarks.semester = semester;
                await existingMarks.save();
                return res.status(200).json(existingMarks);
            }
        }

        const marks = await Marks.create({
            student: studentId,
            subject: subjectId,
            faculty: req.user._id,
            examName,
            semester,
            marksObtained: isAbsent ? 0 : marksObtained,
            totalMarks,
            isAbsent: isAbsent || false
        });
        res.status(201).json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get marks uploaded by faculty
// @route   GET /api/faculty/marks
// @access  Private
const getUploadedMarks = async (req, res) => {
    try {
        const marks = await Marks.find({ faculty: req.user._id })
            .populate('student', 'name email')
            .populate('subject', 'name code')
            .sort('-date');
        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update marks for a student
// @route   PUT /api/faculty/marks/:id
// @access  Private
const updateMarks = async (req, res) => {
    try {
        const { marksObtained, totalMarks, isAbsent } = req.body;

        if (!isAbsent && Number(marksObtained) > Number(totalMarks)) {
            return res.status(400).json({ message: 'Marks obtained cannot be greater than total marks' });
        }

        const mark = await Marks.findById(req.params.id);

        if (!mark) {
            return res.status(404).json({ message: 'Marks not found' });
        }

        // Make sure only the faculty who uploaded it can edit it
        if (mark.faculty.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit these marks' });
        }

        mark.marksObtained = isAbsent ? 0 : Number(marksObtained);
        mark.totalMarks = Number(totalMarks) || mark.totalMarks;
        mark.isAbsent = isAbsent || false;

        await mark.save();
        res.json(mark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete marks
// @route   DELETE /api/faculty/marks/:id
// @access  Private
const deleteMarks = async (req, res) => {
    try {
        const mark = await Marks.findById(req.params.id);

        if (!mark) {
            return res.status(404).json({ message: 'Marks not found' });
        }

        if (mark.faculty.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized to delete these marks' });
        }

        await Marks.findByIdAndDelete(req.params.id);
        res.json({ message: 'Marks deleted successfully' });
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
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate.getTime() !== today.getTime()) {
            return res.status(400).json({ message: 'Attendance can only be marked for today.' });
        }
        
        // Check if attendance is already marked for this subject and date
        const existingAttendance = await Attendance.findOne({
            subject: subjectId,
            date: new Date(date)
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance for this subject on this date has already been marked.' });
        }
        
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

const getAttendanceHistory = async (req, res) => {
    try {
        const history = await Attendance.aggregate([
            { $match: { faculty: req.user._id } },
            { 
                $group: { 
                    _id: { date: "$date", subject: "$subject" },
                    presentCount: { $sum: { $cond: [ { $eq: ["$status", "Present"] }, 1, 0 ] } },
                    absentCount: { $sum: { $cond: [ { $eq: ["$status", "Absent"] }, 1, 0 ] } }
                } 
            },
            { $sort: { "_id.date": -1 } }
        ]);
        
        const Subject = require('../models/Subject');
        const populatedHistory = await Promise.all(history.map(async (record) => {
            const subject = await Subject.findById(record._id.subject);
            return {
                ...record,
                subjectName: subject ? subject.name : 'Unknown Subject'
            };
        }));
        
        res.json(populatedHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAttendanceDetails = async (req, res) => {
    try {
        const { subjectId, date } = req.query;
        if (!subjectId || !date) {
            return res.status(400).json({ message: 'Subject ID and date are required.' });
        }
        const attendanceRecords = await Attendance.find({
            faculty: req.user._id,
            subject: subjectId,
            date: new Date(date)
        }).populate('student', 'name email enrollmentNumber');
        
        res.json(attendanceRecords);
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

        const Attendance = require('../models/Attendance');
        const classesConducted = (await Attendance.aggregate([
            { $match: { faculty: facultyId } },
            { $group: { _id: { date: "$date", subject: "$subject" } } }
        ])).length;

        const Marks = require('../models/Marks');
        const marksUploaded = await Marks.countDocuments({ faculty: facultyId });

        res.json({ assignedSubjects, totalStudents, classesConducted, marksUploaded });
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

const unclaimSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Only block if faculty is explicitly set to a DIFFERENT user
        if (subject.faculty && subject.faculty.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to unclaim this subject' });
        }
        
        // Remove faculty and clear timings so the new teacher can make their own schedule
        subject.faculty = null;
        subject.timings = [];
        await subject.save();
        res.json({ message: 'Subject unclaimed successfully', subject });
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
            semester,
            timings: []
        });
        const createdSubject = await subject.save();
        res.status(201).json(createdSubject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTiming = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { timingSlot } = req.body; // e.g. "Monday 09:00 AM - 10:00 AM"

        const targetSubject = await Subject.findById(subjectId);
        if (!targetSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        if (targetSubject.faculty.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to modify this subject schedule' });
        }

        // Teacher Conflict Check
        const teacherConflict = await Subject.findOne({
            faculty: req.user._id,
            timings: timingSlot
        });

        if (teacherConflict) {
            return res.status(400).json({ message: `You are already teaching another class (${teacherConflict.name}) at this time.` });
        }

        // Student Conflict Check
        const studentConflict = await Subject.findOne({
            course: targetSubject.course,
            semester: targetSubject.semester,
            timings: timingSlot
        });

        if (studentConflict) {
            return res.status(400).json({ message: `The students already have ${studentConflict.name} scheduled at this time.` });
        }

        targetSubject.timings.push(timingSlot);
        await targetSubject.save();
        res.json(targetSubject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeTiming = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { timingSlot } = req.body;

        const targetSubject = await Subject.findById(subjectId);
        if (!targetSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        if (targetSubject.faculty.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to modify this subject schedule' });
        }

        targetSubject.timings = targetSubject.timings.filter(t => t !== timingSlot);
        await targetSubject.save();
        res.json(targetSubject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAssignedSubjects, getStudentsByCourse, markAttendance, uploadMarks, getUploadedMarks, updateMarks, deleteMarks, markBulkAttendance, getAttendanceHistory, getAttendanceDetails, getDashboardStats, getNotices, getAvailableSubjects, claimSubject, unclaimSubject, getCourses, createSubject, deleteSubject, addTiming, removeTiming };
