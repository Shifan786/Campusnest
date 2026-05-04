const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    academicYear: { type: Number, default: 1 }, // 1 = 1st Year, 2 = 2nd Year, etc.
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
