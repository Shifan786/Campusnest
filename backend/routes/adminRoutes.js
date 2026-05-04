const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getSystemStats, createCourse, getCourses, updateCourse, createSubject, createAnnouncement, getNotices, getPendingEnrollments, approveEnrollment, rejectEnrollment, updateAnnouncement, deleteAnnouncement } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.route('/stats').get(getSystemStats);
router.route('/users').get(getUsers);
router.route('/users/:id').delete(deleteUser);

router.route('/courses').get(getCourses).post(createCourse);
router.route('/courses/:id').put(updateCourse);
router.route('/subjects').post(createSubject);
router.route('/announcements').post(createAnnouncement);
router.route('/announcements/:id').put(updateAnnouncement).delete(deleteAnnouncement);
router.route('/notices').get(getNotices);

router.route('/enrollments/pending').get(getPendingEnrollments);
router.route('/enrollments/:id/approve').put(approveEnrollment);
router.route('/enrollments/:id/reject').put(rejectEnrollment);

module.exports = router;
