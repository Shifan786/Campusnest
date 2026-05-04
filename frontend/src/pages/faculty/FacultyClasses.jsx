import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { Users, Search, BookOpen, AlertCircle, Clock, Plus, Trash2, Calendar, LayoutGrid, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIME_SLOTS = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM"
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const FacultyClasses = () => {
    const [activeTab, setActiveTab] = useState('my-classes');

    const ordinalYear = (y) => {
        if (y === 1) return '1st Year';
        if (y === 2) return '2nd Year';
        if (y === 3) return '3rd Year';
        return y + 'th Year';
    };
    
    // My Classes State
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedDay, setSelectedDay] = useState("Monday");
    const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
    const [scheduleMessage, setScheduleMessage] = useState("");
    const [scheduleError, setScheduleError] = useState("");

    // Available Classes State
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [message, setMessage] = useState('');

    const fetchSubjects = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/faculty/subjects', config);
            setSubjects(data);
            if (data.length > 0 && !selectedSubject) {
                setSelectedSubject(data[0]);
                const courseId = data[0].course?._id || data[0].course;
                if (courseId) {
                    fetchStudents(courseId, config);
                } else {
                    setLoading(false);
                }
            } else if (data.length === 0) {
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchAvailable = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/faculty/available-subjects', config);
            setAvailableSubjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchAvailable();
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
        setScheduleMessage("");
        setScheduleError("");
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        if (sub && sub.course) {
            const courseId = sub.course._id || sub.course;
            fetchStudents(courseId, config);
        } else {
            setStudents([]);
        }
    };

    const handleAddTiming = async () => {
        if (!selectedSubject) return;
        try {
            setScheduleError("");
            setScheduleMessage("");
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const timingSlot = `${selectedDay} ${selectedSlot}`;
            const { data } = await axios.post(`http://localhost:5000/api/faculty/subjects/${selectedSubject._id}/timings`, { timingSlot }, config);
            
            const updatedSubjects = subjects.map(s => s._id === data._id ? data : s);
            setSubjects(updatedSubjects);
            setSelectedSubject(data);
            setScheduleMessage("Class slot added successfully!");
            setTimeout(() => setScheduleMessage(""), 3000);
        } catch (error) {
            setScheduleError(error.response?.data?.message || "Failed to add time slot");
            setTimeout(() => setScheduleError(""), 5000);
        }
    };

    const handleRemoveTiming = async (timingSlot) => {
        if (!selectedSubject) return;
        try {
            setScheduleError("");
            setScheduleMessage("");
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}`, data: { timingSlot } } };
            
            const { data } = await axios.delete(`http://localhost:5000/api/faculty/subjects/${selectedSubject._id}/timings`, config);
            
            const updatedSubjects = subjects.map(s => s._id === data._id ? data : s);
            setSubjects(updatedSubjects);
            setSelectedSubject(data);
            setScheduleMessage("Class slot removed successfully!");
            setTimeout(() => setScheduleMessage(""), 3000);
        } catch (error) {
            setScheduleError(error.response?.data?.message || "Failed to remove time slot");
            setTimeout(() => setScheduleError(""), 5000);
        }
    };

    const handleClaim = async (subjectId) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/faculty/subjects/${subjectId}/claim`, {}, config);
            setMessage('Subject claimed successfully!');
            setTimeout(() => setMessage(''), 3000);
            fetchAvailable();
            fetchSubjects();
            setActiveTab('my-classes');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to claim subject');
        }
    };

    const handleUnclaim = async (subjectId) => {
        if (!window.confirm('Are you sure you want to stop teaching this subject? This will remove it from your classes and clear its schedule.')) return;
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/faculty/subjects/${subjectId}/unclaim`, {}, config);
            setMessage('Subject dropped successfully!');
            setTimeout(() => setMessage(''), 3000);
            setSelectedSubject(null);
            fetchAvailable();
            fetchSubjects();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to drop subject');
        }
    };


    const filteredStudents = students.filter(stu => 
        stu.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (stu.enrollmentNumber && stu.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout title="Class Management" subtitle="Manage your active classes or browse available subjects">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 pb-px">
                <button 
                    onClick={() => setActiveTab('my-classes')}
                    className={`pb-4 px-6 font-semibold text-sm transition-all border-b-2 ${activeTab === 'my-classes' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        My Classes
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('available')}
                    className={`pb-4 px-6 font-semibold text-sm transition-all border-b-2 ${activeTab === 'available' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <div className="flex items-center">
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Subject Marketplace
                    </div>
                </button>
            </div>

            {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold rounded-2xl flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    {message}
                </motion.div>
            )}

            {activeTab === 'my-classes' ? (
                <>
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

                    {selectedSubject && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Schedule Manager Section */}
                            <div className="lg:col-span-1">
                                <div className="card-base p-6">
                                    <div className="flex items-center mb-6">
                                        <Calendar className="w-5 h-5 text-indigo-500 mr-2" />
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Schedule</h2>
                                    </div>
                                    
                                    {scheduleMessage && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-xl border border-emerald-200 dark:border-emerald-500/20">{scheduleMessage}</div>}
                                    {scheduleError && <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-200 dark:border-rose-500/20">{scheduleError}</div>}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Day</label>
                                            <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 font-medium text-sm">
                                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Time Slot</label>
                                            <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 font-medium text-sm">
                                                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <button onClick={handleAddTiming} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center">
                                            <Plus className="w-4 h-4 mr-1.5" /> Allot Class Slot
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Slots List */}
                            <div className="lg:col-span-2">
                                <div className="card-base p-6 h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <Clock className="w-5 h-5 text-indigo-500 mr-2" />
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Allotted Timings</h2>
                                        </div>
                                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg">
                                            {selectedSubject.timings?.length || 0} Slots
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(!selectedSubject.timings || selectedSubject.timings.length === 0) ? (
                                            <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                                <p className="text-sm font-medium text-slate-500">No class timings allotted yet.</p>
                                            </div>
                                        ) : (
                                            selectedSubject.timings.map((t, idx) => {
                                                const [day, ...timeParts] = t.split(' ');
                                                const timeStr = timeParts.join(' ');
                                                return (
                                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 group">
                                                        <div>
                                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{day}</span>
                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{timeStr}</p>
                                                        </div>
                                                        <button onClick={() => handleRemoveTiming(t)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors" title="Remove Slot">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                </>
            ) : (
                <>
                    <div className="mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subject Marketplace</h2>
                            <p className="text-sm text-slate-500 mt-1">Manage your active classes or browse available subjects to claim.</p>
                        </div>
                    </div>

                    {subjects.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                                Currently Teaching
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subjects.map((subject, idx) => (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={subject._id} className="card-base p-6 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/5 hover:-translate-y-1 transition-transform duration-300">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-emerald-100 dark:border-emerald-500/20">
                                                {subject.code.substring(0, 2)}
                                            </div>
                                            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-wider">
                                                Active
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 line-clamp-1">{subject.name}</h3>
                                        
                                        <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-start">
                                                <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <p className="text-slate-500 font-medium">Course: <span className="font-bold text-slate-800 dark:text-slate-200">{subject.course?.name || 'N/A'}</span></p>
                                                    <p className="text-slate-500 font-medium mt-1">Semester: <span className="font-bold text-slate-800 dark:text-slate-200">{subject.semester || 'N/A'}</span></p>
                                                    <p className="text-slate-500 font-medium mt-1">Year: <span className="font-bold text-emerald-600 dark:text-emerald-400">{subject.academicYear ? ordinalYear(subject.academicYear) : 'N/A'}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={() => handleUnclaim(subject._id)} className="w-full py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:text-white font-bold rounded-xl transition-all border border-rose-200 dark:border-rose-500/20">
                                            Stop Teaching
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                            <BookOpen className="w-5 h-5 text-indigo-500 mr-2" />
                            Available to Claim
                        </h3>
                        {availableSubjects.length === 0 ? (
                            <div className="card-base p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No Classes Available</h3>
                                <p className="text-slate-500 max-w-md mx-auto">All subjects have been assigned to faculty members. Check back later or create a new class.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableSubjects.map((subject, idx) => (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={subject._id} className="card-base p-6 hover:-translate-y-1 transition-transform duration-300">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-indigo-100 dark:border-indigo-500/20">
                                                {subject.code.substring(0, 2)}
                                            </div>
                                            <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full uppercase tracking-wider">
                                                {subject.code}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 line-clamp-1">{subject.name}</h3>
                                        
                                        <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-start">
                                                <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <p className="text-slate-500 font-medium">Course: <span className="font-bold text-slate-800 dark:text-slate-200">{subject.course?.name || 'N/A'}</span></p>
                                                    <p className="text-slate-500 font-medium mt-1">Semester: <span className="font-bold text-slate-800 dark:text-slate-200">{subject.semester || 'N/A'}</span></p>
                                                    <p className="text-slate-500 font-medium mt-1">Year: <span className="font-bold text-emerald-600 dark:text-emerald-400">{subject.academicYear ? ordinalYear(subject.academicYear) : 'N/A'}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={() => handleClaim(subject._id)} className="w-full py-2.5 bg-white dark:bg-slate-800 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:text-white font-bold rounded-xl transition-all">
                                            Claim Class
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </DashboardLayout>
    );
};

export default FacultyClasses;
