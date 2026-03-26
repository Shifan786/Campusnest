const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Faculty teaching the subject
    semester: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
