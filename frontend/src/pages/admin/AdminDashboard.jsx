import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { Users, UserCheck, BookOpen, AlertCircle, TrendingUp, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/admin/stats', config);
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/30', trend: '+12%', link: '/admin/users' },
        { title: 'Total Faculty', value: stats?.totalFaculty || 0, icon: UserCheck, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/30', trend: '+2%', link: '/admin/users' },
        { title: 'Active Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'bg-blue-500', shadow: 'shadow-blue-500/30', trend: '0%', link: '/admin/courses' },
    ];

    const enrollmentData = stats?.enrollmentData || [];
    const attendanceData = stats?.attendanceData || [];

    return (
        <DashboardLayout title="Administrator Overview" subtitle="System metrics and analytics at a glance">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {cards.map((card, idx) => (
                    <Link to={card.link} key={idx} className="block">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                            className="card-base card-hover p-6 flex flex-col relative overflow-hidden group h-full"
                        >
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-3.5 rounded-2xl ${card.color} text-white shadow-lg ${card.shadow}`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-xl">
                                    <TrendingUp className="w-3 h-3 mr-1" /> {card.trend}
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{card.value}</h3>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
                            </div>
                            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full ${card.color} opacity-5 blur-[40px] group-hover:opacity-20 transition-opacity duration-500`} />
                        </motion.div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-base p-6 lg:p-8 lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Enrollment Trends</h2>
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={enrollmentData}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dx={-15} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                                <Area type="monotone" dataKey="students" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorStudents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-base p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Course Attendance</h2>
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                                <Bar dataKey="rate" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card-base p-6 lg:p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Infrastructure Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link to="/admin/users" className="btn-primary"><Users className="w-5 h-5 mr-2"/> Manage Users</Link>
                    <Link to="/admin/courses" className="btn-primary bg-sky-500 hover:bg-sky-600 shadow-sky-500/20 focus:ring-sky-100 dark:focus:ring-sky-900"><BookOpen className="w-5 h-5 mr-2"/> Manage Courses</Link>
                    <Link to="/admin/notices" className="btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 focus:ring-purple-100 dark:focus:ring-purple-900"><Bell className="w-5 h-5 mr-2"/> Broadcast Notice</Link>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
