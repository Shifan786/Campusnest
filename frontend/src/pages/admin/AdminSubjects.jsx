import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Search, Users, ChevronDown, ChevronRight, Pencil, X, CheckCircle } from 'lucide-react';

const ordinalYear = (y) => {
    const sfx = ['th','st','nd','rd'];
    const v = y % 100;
    return y + (sfx[(v-20)%10] || sfx[v] || sfx[0]) + ' Year';
};

const AdminSubjects = () => {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [message, setMessage] = useState('');
    const [expandedYears, setExpandedYears] = useState({});

    const [form, setForm] = useState({ name: '', code: '', academicYear: 1, semester: 1, course: '' });

    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchCourses = async () => {
        const { data } = await axios.get('http://localhost:5000/api/admin/courses', config);
        setCourses(data);
        if (data.length > 0) {
            setSelectedCourse(data[0]._id);
            setForm(prev => ({ ...prev, course: data[0]._id }));
        }
    };

    const fetchSubjects = async (courseId) => {
        if (!courseId) return;
        const { data } = await axios.get(`http://localhost:5000/api/admin/subjects?course=${courseId}`, config);
        setSubjects(data);
    };

    useEffect(() => { fetchCourses(); }, []);
    useEffect(() => { fetchSubjects(selectedCourse); }, [selectedCourse]);

    const selectedCourseObj = courses.find(c => c._id === selectedCourse);
    const maxYears = selectedCourseObj ? Math.ceil((selectedCourseObj.totalSemesters || 8) / 2) : 4;
    const maxSemPerYear = 2;

    const semesterOptions = Array.from({ length: maxSemPerYear }, (_, i) => {
        const yearBase = (form.academicYear - 1) * 2;
        return yearBase + i + 1;
    });

    const handleCourseChange = (courseId) => {
        setSelectedCourse(courseId);
        setForm(prev => ({ ...prev, course: courseId, academicYear: 1, semester: 1 }));
    };

    const handleOpenModal = (subject = null) => {
        if (subject) {
            setEditingSubject(subject);
            setForm({
                name: subject.name,
                code: subject.code,
                academicYear: subject.academicYear,
                semester: subject.semester,
                course: subject.course?._id || selectedCourse
            });
        } else {
            setEditingSubject(null);
            const yearBase = (form.academicYear - 1) * 2;
            setForm({ name: '', code: '', academicYear: 1, semester: 1, course: selectedCourse });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSubject) {
                await axios.put(`http://localhost:5000/api/admin/subjects/${editingSubject._id}`, form, config);
                setMessage('Subject updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/admin/subjects', form, config);
                setMessage('Subject added successfully!');
            }
            setTimeout(() => setMessage(''), 3000);
            setShowModal(false);
            fetchSubjects(selectedCourse);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save subject');
        }
    };

    const handleDelete = async (subjectId) => {
        if (!window.confirm('Delete this subject from the curriculum? This cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/subjects/${subjectId}`, config);
            setMessage('Subject deleted.');
            setTimeout(() => setMessage(''), 3000);
            fetchSubjects(selectedCourse);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete subject');
        }
    };

    const toggleYear = (year) => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by academic year
    const groupedByYear = {};
    for (let y = 1; y <= maxYears; y++) {
        groupedByYear[y] = filteredSubjects.filter(s => s.academicYear === y);
    }

    return (
        <DashboardLayout title="Curriculum Management" subtitle="Define and manage subjects for each course and academic year">
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative min-w-[220px]">
                        <select
                            value={selectedCourse}
                            onChange={e => handleCourseChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100 font-semibold appearance-none"
                        >
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-sm transition-all group whitespace-nowrap"
                >
                    <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Add Subject
                </button>
            </div>

            {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold rounded-2xl flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />{message}
                </motion.div>
            )}

            {/* Year Accordions */}
            <div className="space-y-4">
                {Array.from({ length: maxYears }, (_, i) => i + 1).map(year => {
                    const yearSubjects = groupedByYear[year] || [];
                    const isOpen = expandedYears[year] !== false; // default open
                    return (
                        <motion.div key={year} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: year * 0.06 }} className="card-base overflow-hidden">
                            <button
                                onClick={() => toggleYear(year)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg mr-4 border border-indigo-100 dark:border-indigo-500/20">
                                        {year}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900 dark:text-white">{ordinalYear(year)}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{yearSubjects.length} subject{yearSubjects.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-slate-100 dark:border-slate-800">
                                            {yearSubjects.length === 0 ? (
                                                <div className="py-10 text-center">
                                                    <p className="text-slate-400 text-sm font-medium">No subjects added for this year yet.</p>
                                                    <button onClick={() => { setForm(prev => ({ ...prev, academicYear: year, semester: (year-1)*2 + 1, course: selectedCourse })); setShowModal(true); setEditingSubject(null); }} className="mt-3 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">
                                                        + Add a subject for {ordinalYear(year)}
                                                    </button>
                                                </div>
                                            ) : (
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</th>
                                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</th>
                                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                                        {yearSubjects.map(sub => (
                                                            <tr key={sub._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{sub.name}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">{sub.code}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">Sem {sub.semester}</td>
                                                                <td className="px-6 py-4">
                                                                    {sub.faculty ? (
                                                                        <span className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                                            <Users className="w-3.5 h-3.5 mr-1.5" />{sub.faculty.name}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/20">Unassigned</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button onClick={() => handleOpenModal(sub)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                                                                            <Pencil className="w-4 h-4" />
                                                                        </button>
                                                                        <button onClick={() => handleDelete(sub._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setShowModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Course</label>
                                    <select
                                        value={form.course}
                                        onChange={e => setForm(prev => ({ ...prev, course: e.target.value }))}
                                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        disabled={!!editingSubject}
                                    >
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                                        <select
                                            value={form.academicYear}
                                            onChange={e => setForm(prev => ({ ...prev, academicYear: Number(e.target.value), semester: (Number(e.target.value) - 1) * 2 + 1 }))}
                                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        >
                                            {Array.from({ length: maxYears }, (_, i) => i + 1).map(y => (
                                                <option key={y} value={y}>{ordinalYear(y)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                                        <select
                                            value={form.semester}
                                            onChange={e => setForm(prev => ({ ...prev, semester: Number(e.target.value) }))}
                                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        >
                                            {semesterOptions.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                                        <input type="text" required value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Data Structures" className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                                        <input type="text" required value={form.code} onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} placeholder="e.g. BCA201" className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent dark:text-white" />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
                                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition">
                                        {editingSubject ? 'Save Changes' : 'Add Subject'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default AdminSubjects;
