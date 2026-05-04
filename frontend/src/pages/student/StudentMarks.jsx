import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { FileText, Award, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentMarks = () => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/student/marks', config);
                setMarks(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMarks();
    }, []);

    // Calculate stats
    const validMarks = marks.filter(m => !m.isAbsent && m.totalMarks > 0);
    const totalExams = marks.length;
    
    let overallAverage = 0;
    let highestPercentage = 0;
    let highestSubject = 'N/A';

    if (validMarks.length > 0) {
        const sumPercentages = validMarks.reduce((acc, curr) => acc + (curr.marksObtained / curr.totalMarks) * 100, 0);
        overallAverage = Math.round(sumPercentages / validMarks.length);
        
        validMarks.forEach(m => {
            const p = (m.marksObtained / m.totalMarks) * 100;
            if (p > highestPercentage) {
                highestPercentage = Math.round(p);
                highestSubject = m.subject?.name || 'Unknown';
            }
        });
    }

    if (loading) {
        return (
            <DashboardLayout title="Academic Results">
                <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading academic records...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Academic Results" subtitle="Check your examination results and academic performance">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6 border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Overall Average</p>
                            <h3 className="text-4xl font-black text-slate-800 dark:text-white">{overallAverage}%</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-4">
                        <div className={`h-2 rounded-full ${overallAverage >= 75 ? 'bg-indigo-500' : overallAverage >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${overallAverage}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-3">
                        {overallAverage >= 75 ? 'Excellent overall academic performance.' : overallAverage >= 40 ? 'Average performance. Room for improvement.' : 'Warning: Poor academic performance.'}
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Exams Taken</p>
                            <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{validMarks.length}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">Out of {totalExams} total exams</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                            <Target className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Highest Score</p>
                            <h3 className="text-4xl font-black text-amber-500 dark:text-amber-400">{highestPercentage}%</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 truncate max-w-[150px]" title={highestSubject}>{highestSubject}</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-500">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Detailed Logs Table */}
            <div className="card-base overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-indigo-500" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Exam Results</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                        <thead className="bg-white dark:bg-slate-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Semester</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800/50">
                            {marks.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                        <p className="font-medium">No examination records found yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                marks.map((record) => {
                                    const percentage = record.isAbsent ? 0 : Math.round((record.marksObtained / record.totalMarks) * 100);
                                    return (
                                        <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{record.examName}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{record.subject?.name}</p>
                                                <p className="text-xs text-slate-500">{record.subject?.code}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                Sem {record.semester}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {record.isAbsent ? (
                                                    <span className="text-sm text-slate-400 font-medium">N/A</span>
                                                ) : (
                                                    <div className="flex items-baseline">
                                                        <span className="text-lg font-black text-slate-800 dark:text-white">{record.marksObtained}</span>
                                                        <span className="text-xs text-slate-500 ml-1">/ {record.totalMarks}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {record.isAbsent ? (
                                                    <span className="px-3 py-1 text-xs rounded-lg font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                        Absent
                                                    </span>
                                                ) : (
                                                    <span className={`px-3 py-1 text-xs rounded-lg font-bold ${
                                                        percentage >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        percentage >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                                                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`}>
                                                        {percentage}%
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentMarks;
