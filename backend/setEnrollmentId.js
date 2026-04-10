require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const students = await User.find({ role: 'Student' });
        let count = 1;
        for (const student of students) {
            // Re-assign or just assign if not present
            if (!student.enrollmentNumber || student.enrollmentNumber === '') {
                // Generate a random 6-digit ID or sequential
                student.enrollmentNumber = `STU${new Date().getFullYear()}${String(count).padStart(3, '0')}`;
                await student.save();
                console.log(`Updated ${student.name} with Enrollment ID: ${student.enrollmentNumber}`);
                count++;
            }
        }
        console.log("Successfully assigned enrollment IDs to all students.");
    } catch (error) {
        console.error("Error setting enrollment IDs:", error);
    } finally {
        process.exit(0);
    }
});
