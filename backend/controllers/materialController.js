const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

// @desc    Upload study material
// @route   POST /api/materials/upload
// @access  Private (Faculty)
exports.uploadMaterial = async (req, res) => {
    try {
        const { title, description, course } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newMaterial = new Material({
            title,
            description,
            fileUrl: `/uploads/materials/${req.file.filename}`,
            uploadedBy: req.user._id,
            course
        });

        await newMaterial.save();
        res.status(201).json(newMaterial);
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
        // Here we could filter by course if the student had a specific course, but currently students just view all materials or filter on frontend
        // Assuming we return all materials for now.
        const materials = await Material.find().populate('course', 'name').populate('uploadedBy', 'name');
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
