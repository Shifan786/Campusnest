import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Galaxy from '../components/Galaxy';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (newPassword.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-500">
            <div className="absolute inset-0 z-0">
                <Galaxy 
                    mouseRepulsion={true}
                    mouseInteraction={true}
                    density={1.5}
                    glowIntensity={0.5}
                    saturation={0.8}
                    hueShift={240}
                />
            </div>
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/20 dark:bg-purple-600/20 blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/50 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] z-10"
            >
                <div className="text-center mb-8">
                    <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 rounded-[1rem] bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-6"
                    >
                        <KeyRound className="text-white w-8 h-8" />
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {step === 1 && "Forgot Password"}
                        {step === 2 && "Enter OTP"}
                        {step === 3 && "Create New Password"}
                        {step === 4 && "Password Reset!"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                        {step === 1 && "Enter your email to receive a secure OTP"}
                        {step === 2 && `We sent a 6-digit code to ${email}`}
                        {step === 3 && "Choose a strong, secure new password"}
                        {step === 4 && "Your password has been successfully updated"}
                    </p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm font-medium shadow-sm text-center">
                        {error}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleRequestOTP} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input 
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium backdrop-blur-lg"
                                    placeholder="Enter your email address"
                                />
                            </div>
                            <button disabled={loading} type="submit" className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all mt-6 disabled:opacity-70">
                                {loading ? 'Sending...' : 'Send OTP'} <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input 
                                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6}
                                    className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium backdrop-blur-lg text-center tracking-[0.5em] text-xl"
                                    placeholder="------"
                                />
                            </div>
                            <button disabled={loading} type="submit" className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all mt-6 disabled:opacity-70">
                                {loading ? 'Verifying...' : 'Verify OTP'} <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleResetPassword} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input 
                                    type={showNewPassword ? "text" : "password"} 
                                    required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium backdrop-blur-lg"
                                    placeholder="New Password"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium backdrop-blur-lg"
                                    placeholder="Confirm New Password"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <button disabled={loading} type="submit" className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all mt-6 disabled:opacity-70">
                                {loading ? 'Saving...' : 'Reset Password'} <CheckCircle2 className="ml-2 w-5 h-5" />
                            </button>
                        </motion.form>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <Link to="/login" className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
                                Return to Login
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {step === 1 && (
                    <div className="mt-8 text-center pt-6 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Remembered your password? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Back to Login</Link>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
