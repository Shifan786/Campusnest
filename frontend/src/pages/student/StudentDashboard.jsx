import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Bell, FileText, CheckCircle2, Clock, BookOpen, XCircle } from 'lucide-react';

const StudentDashboard = () => {
    const [stats, setStats] = useState(null);
    const [notices, setNotices] = useState([]);
    
    const [enrollmentData, setEnrollmentData] = useState({ status: 'Loading', course: null });
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const statusRes = await axios.get('http://localhost:5000/api/student/enrollment-status', config);
                setEnrollmentData({ status: statusRes.data.enrollmentStatus || 'None', course: statusRes.data.course });

                if (statusRes.data.enrollmentStatus === 'Approved') {
                    const statsRes = await axios.get('http://localhost:5000/api/student/dashboard-stats', config);
                    setStats(statsRes.data);
                    
                    const noticeRes = await axios.get('http://localhost:5000/api/student/notices', config);
                    setNotices(noticeRes.data.slice(0, 5));
                } else if (statusRes.data.enrollmentStatus === 'None' || statusRes.data.enrollmentStatus === 'Rejected') {
                    const coursesRes = await axios.get('http://localhost:5000/api/student/courses', config);
                    setCourses(coursesRes.data);
                    if (coursesRes.data.length > 0) setSelectedCourse(coursesRes.data[0]._id);
                }
            } catch (error) {
                console.error(error);
                setEnrollmentData({ status: 'Error' });
            }
        };
        fetchData();
    }, []);

    const handleEnroll = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/student/enroll', { courseId: selectedCourse }, config);
            setEnrollmentData({ status: data.enrollmentStatus, course: data.course });
        } catch (error) {
            alert('Failed to submit enrollment');
        } finally {
            setSubmitting(false);
        }
    };

    const attendanceRate = (stats && stats.totalClasses > 0) ? Math.round((stats.attended / stats.totalClasses) * 100) : 0;
    const absent = (stats?.totalClasses || 0) - (stats?.attended || 0);
    const pieData = [
        { name: 'Attended', value: stats?.attended || 0 },
        { name: 'Absent', value: absent > 0 ? absent : 0.0001 }, // rendering trick for recharts
    ];
    const COLORS = ['#10b981', '#f43f5e'];

    if (enrollmentData.status === 'Loading') return <DashboardLayout title="Student Hub"><div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading profile...</div></DashboardLayout>;

    if (enrollmentData.status !== 'Approved') {
        return (
            <DashboardLayout title="Course Enrollment" subtitle="You must be enrolled in a course to access the dashboard">
                <div className="max-w-xl mx-auto mt-12">
                    {enrollmentData.status === 'Pending' ? (
                        <div className="card-base p-12 text-center border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-900">
                            <Clock className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Application Pending</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Your course enrollment request has been sent to the administration. You will gain full access to the student hub once approved.</p>
                        </div>
                    ) : (
                        <div className="card-base p-8 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                            {enrollmentData.status === 'Rejected' && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center">
                                    <XCircle className="w-5 h-5 mr-3 shrink-0" /> Your previous enrollment request was rejected. Please select a valid course.
                                </div>
                            )}
                            <div className="mb-8 text-center">
                                <BookOpen className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Select Your Program</h2>
                                <p className="text-slate-500 mt-2 text-sm font-medium">Choose from our available academic programs to request enrollment.</p>
                            </div>
                            
                            <form onSubmit={handleEnroll} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Available Courses</label>
                                    <select 
                                        className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                        value={selectedCourse}
                                        onChange={e => setSelectedCourse(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>-- Select a course --</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={submitting || !selectedCourse} className="w-full btn-primary py-4 text-lg shadow-indigo-500/30">
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Student Hub" subtitle="Your academic performance and university updates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-base p-8 flex flex-col items-center justify-center relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1 border-indigo-200 dark:border-indigo-900 bg-indigo-50/80 dark:bg-indigo-900/10">
                    <div className="text-center w-full relative z-10">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Attendance</h3>
                        <div className="flex items-end justify-center">
                            <span className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">{attendanceRate}</span>
                            <span className="text-2xl font-bold text-slate-500 mb-1.5 ml-1">%</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-3 font-semibold">{stats?.attended} of {stats?.totalClasses} completed</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card-base p-8 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Average Marks</h3>
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl shadow-sm"><FileText className="w-6 h-6" /></div>
                    </div>
                    <div>
                        <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">{stats?.averageMarks}%</span>
                        <p className="text-sm text-emerald-600 font-bold mt-4 flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl w-fit"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Class Average: 71%</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="card-base p-8 lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Overall Performance breakdown</h2>
                    <div className="h-32 flex items-center">
                        <div className="w-1/3 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={35} outerRadius={55} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={6}>
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-2/3 pl-8">
                            <div className="flex justify-between items-center mb-3"><span className="text-sm font-semibold text-slate-500">Present</span><span className="font-extrabold text-emerald-500 text-lg">{stats?.attended}</span></div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-5"><div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${attendanceRate}%` }}></div></div>
                            <div className="flex justify-between items-center mb-3"><span className="text-sm font-semibold text-slate-500">Absent</span><span className="font-extrabold text-rose-500 text-lg">{stats?.totalClasses - stats?.attended}</span></div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5"><div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${100 - attendanceRate}%` }}></div></div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-base p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center"><Bell className="w-6 h-6 mr-3 text-indigo-500" /> Recent Digital Notices</h2>
                    <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full shadow-sm border border-indigo-100 dark:border-indigo-800">New</span>
                </div>
                
                <div className="space-y-5">
                    {notices.map((notice) => (
                        <div key={notice._id} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">{notice.title}</h3>
                                <div className="flex items-center text-xs font-bold text-slate-500 tracking-wide bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit">
                                    {new Date(notice.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{notice.content}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
