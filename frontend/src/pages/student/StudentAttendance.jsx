import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { Clock, BookOpen, CheckCircle2, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/student/attendance', config);
                setAttendance(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    // Calculate overall stats
    const totalClasses = attendance.length;
    const attendedClasses = attendance.filter(record => record.status === 'Present' || record.status === 'Late').length;
    const overallPercentage = totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

    // Group by subject
    const subjectStats = {};
    attendance.forEach(record => {
        const subName = record.subject?.name || 'Unknown Subject';
        if (!subjectStats[subName]) {
            subjectStats[subName] = { total: 0, attended: 0, code: record.subject?.code };
        }
        subjectStats[subName].total += 1;
        if (record.status === 'Present' || record.status === 'Late') {
            subjectStats[subName].attended += 1;
        }
    });

    const subjectBreakdown = Object.keys(subjectStats).map(key => ({
        name: key,
        code: subjectStats[key].code,
        total: subjectStats[key].total,
        attended: subjectStats[key].attended,
        percentage: Math.round((subjectStats[key].attended / subjectStats[key].total) * 100)
    }));

    if (loading) {
        return (
            <DashboardLayout title="Attendance Hub">
                <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading attendance records...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Attendance Hub" subtitle="Track your daily presence and subject-wise performance">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6 border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Overall Rate</p>
                            <h3 className="text-4xl font-black text-slate-800 dark:text-white">{overallPercentage}%</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-4">
                        <div className={`h-2 rounded-full ${overallPercentage >= 75 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${overallPercentage}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-3">
                        {overallPercentage >= 75 ? 'You are maintaining a good attendance record.' : 'Warning: Your attendance is below the recommended 75% threshold.'}
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Classes Attended</p>
                            <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{attendedClasses}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">Out of {totalClasses} total sessions</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Classes Missed</p>
                            <h3 className="text-4xl font-black text-rose-600 dark:text-rose-400">{totalClasses - attendedClasses}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">Recorded absences</p>
                        </div>
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-500">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Subject Breakdown */}
                <div className="col-span-1 lg:col-span-1 space-y-6">
                    <div className="card-base p-6">
                        <div className="flex items-center mb-6">
                            <BookOpen className="w-5 h-5 text-indigo-500 mr-2" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject Breakdown</h2>
                        </div>
                        <div className="space-y-5">
                            {subjectBreakdown.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center">No subject data available.</p>
                            ) : (
                                subjectBreakdown.map((sub, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{sub.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{sub.code}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-black text-lg ${sub.percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{sub.percentage}%</span>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase">{sub.attended}/{sub.total} Classes</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full transition-all duration-500 ${sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${sub.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Logs Table */}
                <div className="col-span-1 lg:col-span-2">
                    <div className="card-base overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-3 text-indigo-500" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Attendance Logs</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                                <thead className="bg-white dark:bg-slate-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {attendance.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                                <p className="font-medium">No attendance records found yet.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        attendance.map((record) => (
                                            <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{record.subject?.name}</p>
                                                    <p className="text-xs text-slate-500">{record.subject?.code}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                    Prof. {record.faculty?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 text-xs rounded-lg font-bold inline-flex items-center ${
                                                        record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        record.status === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                                                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`}>
                                                        {record.status === 'Present' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                                                        {record.status === 'Absent' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentAttendance;
