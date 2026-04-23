import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, BookOpen, Clock, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [schedule, setSchedule] = useState([]);

    const handleDeleteSubject = async (subjectId) => {
        if (!window.confirm("Are you sure you want to permanently delete this class from your schedule?")) return;
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/faculty/subjects/${subjectId}`, config);
            setSchedule(prev => prev.filter(s => s._id !== subjectId));
            
            const { data: statsData } = await axios.get('http://localhost:5000/api/faculty/dashboard-stats', config);
            setStats(statsData);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete class');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const { data: statsData } = await axios.get('http://localhost:5000/api/faculty/dashboard-stats', config);
                setStats(statsData);

                const { data: subjectsData } = await axios.get('http://localhost:5000/api/faculty/subjects', config);
                const formattedSchedule = subjectsData.map((sub) => {
                    return {
                        _id: sub._id,
                        title: `${sub.code} ${sub.name}`,
                        time: sub.timing || "TBD",
                        status: "Upcoming"
                    };
                });
                
                setSchedule(formattedSchedule.length > 0 ? formattedSchedule : [
                    { title: 'No classes scheduled today', time: '--:--', status: 'Upcoming' }
                ]);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const cards = [
        { title: 'Assigned Subjects', value: stats?.assignedSubjects || 0, icon: BookOpen, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/30', link: '/faculty/classes' },
        { title: 'Total Enrolled', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500', shadow: 'shadow-blue-500/30', link: '/faculty/classes' },
        { title: 'Classes Conducted', value: stats?.classesConducted || 0, icon: Clock, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/30', link: '/faculty/attendance' },
        { title: 'Marks Uploaded', value: stats?.marksUploaded || 0, icon: FileText, color: 'bg-rose-500', shadow: 'shadow-rose-500/30', link: '/faculty/marks' },
    ];

    return (
        <DashboardLayout title="Faculty Portal" subtitle="Manage your subjects, classes, and student performance">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
                {cards.map((card, idx) => (
                    <Link to={card.link} key={idx} className="block">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                            className="card-base card-hover p-6 lg:p-8 flex flex-col relative overflow-hidden group h-full"
                        >
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className={`p-4 rounded-2xl ${card.color} text-white shadow-lg ${card.shadow}`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{card.value}</h3>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</p>
                            </div>
                            <div className={`absolute -bottom-12 -right-12 w-40 h-40 rounded-full ${card.color} opacity-5 blur-[50px] group-hover:opacity-20 transition-opacity duration-500`} />
                        </motion.div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-base p-6 lg:p-8 lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <Clock className="w-6 h-6 mr-3 text-indigo-500" /> Today's Schedule
                    </h2>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                        {schedule.map((item, idx) => (
                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-700 text-slate-500 group-[.is-active]:bg-indigo-500 group-[.is-active]:text-indigo-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                    {item.status === 'Completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-300" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">{item.title}</h3>
                                        {item._id && (
                                            <button 
                                                onClick={() => handleDeleteSubject(item._id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete Class"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-wide">{item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-base p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Tools</h2>
                    <div className="flex flex-col gap-4">
                        <Link to="/faculty/available-classes" className="btn-primary bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20 focus:ring-indigo-100 dark:focus:ring-indigo-900 justify-start py-4 text-base"><BookOpen className="w-5 h-5 mr-3 opacity-70"/> Select Class to Take</Link>
                        <Link to="/faculty/classes" className="btn-primary bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 focus:ring-blue-100 dark:focus:ring-blue-900 justify-start py-4 text-base"><Users className="w-5 h-5 mr-3 opacity-70"/> View Enrolled Students</Link>
                        <Link to="/faculty/attendance" className="btn-primary bg-sky-500 hover:bg-sky-600 shadow-sky-500/20 focus:ring-sky-100 dark:focus:ring-sky-900 justify-start py-4 text-base"><CheckCircle2 className="w-5 h-5 mr-3 opacity-70"/> Mark Bulk Attendance</Link>
                        <Link to="/faculty/marks" className="btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 focus:ring-emerald-100 dark:focus:ring-emerald-900 justify-start py-4 text-base"><FileText className="w-5 h-5 mr-3 opacity-70"/> Upload Exam Marks</Link>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default FacultyDashboard;
