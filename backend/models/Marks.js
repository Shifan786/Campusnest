const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    examName: { type: String, required: true }, // e.g. "1st internal", "2nd internal", "Sem exam"
    semester: { type: Number, required: true },
    marksObtained: { type: Number, required: function() { return !this.isAbsent; }, default: 0 },
    totalMarks: { type: Number, required: true },
    isAbsent: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);
    