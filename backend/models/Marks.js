const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    examName: { type: String, required: true }, // e.g. "Midterm", "Final"
    marksObtained: { type: Number, required: function() { return !this.isAbsent; }, default: 0 },
    totalMarks: { type: Number, required: true },
    isAbsent: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);
    