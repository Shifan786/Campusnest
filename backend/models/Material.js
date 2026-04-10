const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
