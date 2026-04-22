const express = require('express');
const router = express.Router();
const { getGrades, getAttendance, getNotices, getDashboardStats, getAvailableCourses, submitEnrollment, getEnrollmentStatus, getTimetable } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/grades').get(getGrades);
router.route('/attendance').get(getAttendance);
router.route('/notices').get(getNotices);
router.route('/dashboard-stats').get(getDashboardStats);
router.route('/courses').get(getAvailableCourses);
router.route('/enroll').post(submitEnrollment);
router.route('/enrollment-status').get(getEnrollmentStatus);
router.route('/timetable').get(getTimetable);

module.exports = router;
