const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        $or: [
            { email: email },
            { name: email },
            { enrollmentNumber: email }
        ]
    });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Register a new user (Admin)
// @route   POST /api/auth/register
// @access  Public (Initial setup, normally protected to Admin only)
const registerUser = async (req, res) => {
    const { name, email, password, role, enrollmentNumber, employeeId, department } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    let finalRole = role || 'Student';
    let finalEnrollmentNumber = enrollmentNumber;

    // Automatically generate an enrollment number for new students if not provided
    if (finalRole === 'Student' && !finalEnrollmentNumber) {
        const randomStr = Math.floor(1000 + Math.random() * 9000);
        finalEnrollmentNumber = `ENR${new Date().getFullYear()}${randomStr}`;
    }

    const user = await User.create({
        name,
        email,
        password,
        role: finalRole,
        enrollmentNumber: finalEnrollmentNumber,
        employeeId,
        department
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Get user profile (All roles)
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            enrollmentNumber: user.enrollmentNumber,
            employeeId: user.employeeId,
            department: user.department
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id, updatedUser.role),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash OTP before saving
        const salt = await require('bcryptjs').genSalt(10);
        const hashedOTP = await require('bcryptjs').hash(otp, salt);

        user.resetPasswordOTP = hashedOTP;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const emailHtml = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Here is your OTP (One-Time Password):</p>
            <h1 style="letter-spacing: 5px; font-size: 36px;">${otp}</h1>
            <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP',
            html: emailHtml
        });

        res.json({ message: 'OTP sent to email successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const isMatch = await require('bcryptjs').compare(otp, user.resetPasswordOTP);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const isMatch = await require('bcryptjs').compare(otp, user.resetPasswordOTP);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile, requestPasswordReset, verifyOTP, resetPassword };
