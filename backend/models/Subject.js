const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Faculty teaching the subject
    semester: { type: Number },
    academicYear: { type: Number, default: 1 }, // 1 = 1st Year, 2 = 2nd Year, etc.
    timing: { type: String, default: "TBD" }, // Keep for legacy
    timings: [{ type: String }], // Array of 12-hour formatted slots, e.g., "Monday 09:00 AM - 10:00 AM"
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
