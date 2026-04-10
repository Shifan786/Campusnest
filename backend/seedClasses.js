require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        console.log("Connected to MongoDB.");
        
        // Find existing courses to attach classes to
        const courses = await Course.find();
        if (courses.length === 0) {
            console.log("No courses found. Cannot seed subjects.");
            process.exit(1);
        }

        const btechCourse = courses[0]; // Just use the first course generally

        const preDefinedSubjects = [
            { name: "Advanced Artificial Intelligence", code: "CS501", course: btechCourse._id, semester: 5, timing: "Mon/Wed 10:00 AM - 11:30 AM" },
            { name: "Cloud Computing Architectures", code: "CS502", course: btechCourse._id, semester: 5, timing: "Tue/Thu 02:00 PM - 03:30 PM" },
            { name: "Quantum Computing Basics", code: "CS503", course: btechCourse._id, semester: 6, timing: "Fri 09:00 AM - 12:00 PM" },
            { name: "Cybersecurity & Cryptography", code: "CS601", course: btechCourse._id, semester: 6, timing: "Mon/Wed 01:00 PM - 02:30 PM" },
            { name: "Internet of Things (IoT)", code: "CS602", course: btechCourse._id, semester: 7, timing: "Tue/Thu 11:00 AM - 12:30 PM" }
        ];

        let createdCount = 0;
        for (const sub of preDefinedSubjects) {
            const exists = await Subject.findOne({ code: sub.code });
            if (!exists) {
                await Subject.create(sub);
                createdCount++;
                console.log(`Created available subject: ${sub.name} [${sub.timing}]`);
            } else {
                console.log(`Subject ${sub.code} already exists.`);
            }
        }
        
        console.log(`Successfully seeded ${createdCount} new available classes.`);
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        process.exit(0);
    }
});
