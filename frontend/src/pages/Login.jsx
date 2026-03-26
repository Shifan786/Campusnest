import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'Admin') navigate('/admin');
            else if (user.role === 'Faculty') navigate('/faculty');
            else navigate('/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/20 dark:bg-purple-600/20 blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/50 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] z-10"
            >
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ rotate: -15, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-[1.25rem] bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-6"
                    >
                        <GraduationCap className="text-white w-10 h-10" />
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">ERPEdge</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back, securely step inside.</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm font-medium shadow-sm">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium backdrop-blur-lg"
                            placeholder="Email address"
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium backdrop-blur-lg"
                            placeholder="Password"
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-all mt-6"
                    >
                        <LogIn className="w-5 h-5 mr-3" />
                        Sign In to Portal
                    </motion.button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Don't have an account? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Register here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
