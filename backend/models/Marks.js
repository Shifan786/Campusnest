const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    examName: { type: String, required: true }, // e.g. "Midterm", "Final"
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);
