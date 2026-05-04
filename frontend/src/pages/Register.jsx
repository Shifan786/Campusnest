import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Galaxy from '../components/Galaxy';
const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await register(formData);
            if (user.role === 'Admin') navigate('/admin');
            else if (user.role === 'Faculty') navigate('/faculty');
            else navigate('/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
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
                    hueShift={160}
                />
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/20 dark:bg-emerald-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/20 dark:bg-teal-600/20 blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/50 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] z-10"
            >
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ rotate: 15, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-[1.25rem] bg-gradient-to-tr from-teal-500 to-emerald-600 shadow-xl shadow-teal-500/30 mb-6"
                    >
                        <UserPlus className="text-white w-10 h-10" />
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Join CampusNest</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create your institutional account.</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm font-medium shadow-sm">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input name="name" type="text" required onChange={handleChange} className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium backdrop-blur-lg" placeholder="Full Name" />
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input name="email" type="email" required onChange={handleChange} className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium backdrop-blur-lg" placeholder="Email address" />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input 
                            name="password" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            onChange={handleChange} 
                            className="block w-full pl-12 pr-12 py-3.5 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium backdrop-blur-lg" 
                            placeholder="Password" 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-teal-500 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    <div>
                        <select name="role" onChange={handleChange} className="block w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium backdrop-blur-lg cursor-pointer [&>option]:text-slate-900">
                            <option value="Student">Student</option>
                        </select>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-teal-600/20 font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-900 transition-all mt-6"
                    >
                        Create Account
                    </motion.button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Already have an account? <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
