const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: String }, // e.g. "4 Years", "2 Semesters"
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
