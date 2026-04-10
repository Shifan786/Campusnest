import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { Users, Search, BookOpen, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FacultyClasses = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/faculty/subjects', config);
                setSubjects(data);
                if (data.length > 0) {
                    setSelectedSubject(data[0]);
                    const courseId = data[0].course?._id || data[0].course;
                    if (courseId) {
                        fetchStudents(courseId, config);
                    } else {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const fetchStudents = async (courseId, config) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/faculty/students/${courseId}`, config);
            setStudents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectChange = (subjectId) => {
        const sub = subjects.find(s => s._id === subjectId);
        setSelectedSubject(sub);
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        if (sub && sub.course) {
            const courseId = sub.course._id || sub.course;
            fetchStudents(courseId, config);
        } else {
            setStudents([]);
        }
    };

    const filteredStudents = students.filter(stu => 
        stu.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (stu.enrollmentNumber && stu.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout title="My Classes & Students" subtitle="View and manage the students enrolled in your subjects">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Select Class/Subject</label>
                    <div className="relative">
                        <select 
                            className="w-full pl-10 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100 shadow-sm appearance-none transition-all font-medium"
                            onChange={e => handleSubjectChange(e.target.value)}
                            value={selectedSubject ? selectedSubject._id : ''}
                        >
                            {subjects.length === 0 ? <option value="">No subjects assigned</option> : subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                        </select>
                        <BookOpen className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Search Students</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100 shadow-sm transition-all"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base overflow-hidden relative">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/50 flex items-center bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center mr-4">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enrolled Students</h2>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{selectedSubject?.course?.name || 'Loading class details...'}</p>
                    </div>
                    <div className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg">
                        {students.length} Students
                    </div>
                </div>
                
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">Student Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">Enrollment ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-8 h-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4"></div>
                                            <p className="font-semibold">Loading students...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Students Found</h3>
                                            <p>No students match your criteria for this class.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((stu) => (
                                    <tr key={stu._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm mr-4">
                                                    {stu.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{stu.name}</div>
                                                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stu.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                            {stu.enrollmentNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                                                Enrolled
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default FacultyClasses;
