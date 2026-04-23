const express = require('express');
const router = express.Router();
const { getAssignedSubjects, getStudentsByCourse, markAttendance, uploadMarks, getUploadedMarks, updateMarks, deleteMarks, markBulkAttendance, getDashboardStats, getNotices, getAvailableSubjects, claimSubject, getCourses, createSubject, deleteSubject } = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All faculty routes are protected and restricted to Faculty/Admin
router.use(protect);
router.use(authorize('Faculty', 'Admin'));

router.route('/dashboard-stats').get(getDashboardStats);
router.route('/notices').get(getNotices);
router.route('/courses').get(getCourses);
router.route('/subjects').get(getAssignedSubjects).post(createSubject);
router.route('/subjects/:id').delete(deleteSubject);
router.route('/available-subjects').get(getAvailableSubjects);
router.route('/subjects/:id/claim').put(claimSubject);
router.route('/attendance').post(markAttendance);
router.route('/attendance/bulk').post(markBulkAttendance); // The new bulk endpoint
router.route('/marks').post(uploadMarks).get(getUploadedMarks);
router.route('/marks/:id').put(updateMarks).delete(deleteMarks);
router.route('/students/:courseId').get(getStudentsByCourse);

module.exports = router;
