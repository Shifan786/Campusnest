const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

// @desc    Upload study material
// @route   POST /api/materials/upload
// @access  Private (Faculty)
exports.uploadMaterial = async (req, res) => {
    try {
        const { title, description, course, academicYear } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newMaterial = new Material({
            title,
            description,
            fileUrl: `/uploads/materials/${req.file.filename}`,
            uploadedBy: req.user._id,
            course,
            academicYear: Number(academicYear) || 1
        });

        await newMaterial.save();
        const populated = await Material.findById(newMaterial._id).populate('course', 'name totalSemesters');
        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get materials for a faculty member
// @route   GET /api/materials/faculty
// @access  Private (Faculty)
exports.getMaterialsByFaculty = async (req, res) => {
    try {
        const materials = await Material.find({ uploadedBy: req.user._id }).populate('course', 'name');
        res.json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get materials for student
// @route   GET /api/materials/student
// @access  Private (Student)
exports.getMaterialsForStudent = async (req, res) => {
    try {
        // Filter strictly by the student's course AND academic year
        const { course, academicYear } = req.user;
        
        const filter = {};
        if (course) filter.course = course;
        if (academicYear) filter.academicYear = academicYear;
        
        const materials = await Material.find(filter)
            .populate('course', 'name')
            .populate('uploadedBy', 'name')
            .sort('-createdAt');
        res.json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Private (Faculty)
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        if (material.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Remove file from filesystem
        const filePath = path.join(__dirname, '..', material.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await material.deleteOne();
        res.json({ message: 'Material removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
