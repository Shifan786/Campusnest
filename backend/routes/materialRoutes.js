const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadMaterial, getMaterialsByFaculty, getMaterialsForStudent, deleteMaterial } = require('../controllers/materialController');

// Configure multer storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/materials');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(pdf|doc|docx|ppt|pptx|txt|webp|jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a valid document or image format'));
        }
        cb(null, true);
    }
});

// Routes
router.post('/upload', protect, authorize('Admin', 'Faculty'), upload.single('file'), uploadMaterial);
router.get('/faculty', protect, authorize('Admin', 'Faculty'), getMaterialsByFaculty);
router.get('/student', protect, getMaterialsForStudent);
router.delete('/:id', protect, authorize('Admin', 'Faculty'), deleteMaterial);

module.exports = router;
