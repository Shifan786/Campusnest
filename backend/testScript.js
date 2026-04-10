require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const students = await User.find({ role: 'Student' });
    console.log(JSON.stringify(students.slice(0, 3), null, 2));
    process.exit(0);
});
