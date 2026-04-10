import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { BookPlus, PlusCircle, CheckCircle2, X, Trash2 } from 'lucide-react';

const FacultyAvailableClasses = () => {
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [courses, setCourses] = useState([]);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', code: '', course: '', semester: '', timing: '' });

    const fetchAvailable = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/faculty/available-subjects', config);
            setAvailableSubjects(data);
        } catch (error) {
            console.error('Error fetching available subjects', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/faculty/courses', config);
            setCourses(data);
            if (data.length > 0) setNewSubject(prev => ({ ...prev, course: data[0]._id }));
        } catch (error) {
            console.error('Error fetching courses', error);
        }
    };

    useEffect(() => {
        fetchAvailable();
        fetchCourses();
    }, []);

    const handleClaim = async (subjectId) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/faculty/subjects/${subjectId}/claim`, {}, config);
            setMessage('Subject claimed successfully!');
            setTimeout(() => setMessage(''), 3000);
            fetchAvailable();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to claim subject');
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (!window.confirm("Are you sure you want to permanently delete this available class?")) return;
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/faculty/subjects/${subjectId}`, config);
            setMessage('Subject deleted successfully!');
            setTimeout(() => setMessage(''), 3000);
            fetchAvailable();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete class');
        }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/faculty/subjects', newSubject, config);
            setMessage('New class created and claimed successfully!');
            setTimeout(() => setMessage(''), 3000);
            setShowModal(false);
            setNewSubject({ name: '', code: '', course: courses.length > 0 ? courses[0]._id : '', semester: '', timing: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create new class');
        }
    };

    return (
        <DashboardLayout title="Available Classes" subtitle="Browse and claim subjects that do not currently have an assigned faculty member">
            {message && <div className="mb-6 p-4 bg-emerald-100/50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center font-medium shadow-sm"><CheckCircle2 className="w-5 h-5 mr-3"/>{message}</div>}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div></div>
                <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition font-medium text-sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableSubjects.length === 0 ? (
                    <div className="col-span-full p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-slate-700">
                            <BookPlus className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Classes Available</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">All subjects have been assigned to faculty members. Check back later or contact administration.</p>
                    </div>
                ) : (
                    availableSubjects.map(subject => (
                        <div key={subject._id} className="card-base p-6 flex flex-col group border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">{subject.name}</h3>
                                    <span className="inline-block mt-3 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800 tracking-wide uppercase">
                                        {subject.code}
                                    </span>
                                </div>
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                                    <BookPlus className="w-6 h-6" />
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="text-sm">
                                    <p className="text-slate-500 font-medium">Course: <span className="font-bold text-slate-800 dark:text-slate-200">{subject.course?.name || 'N/A'}</span></p>
                                    <p className="text-slate-500 font-medium mt-1">Semester: <span className="font-bold text-slate-800 dark:text-slate-200">{subject.semester || 'N/A'}</span></p>
                                    <p className="text-slate-500 font-medium mt-1">Timing: <span className="font-bold text-slate-800 dark:text-slate-200">{subject.timing || 'TBD'}</span></p>
                                </div>
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => handleDeleteSubject(subject._id)}
                                        className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shadow-sm"
                                        title="Delete Class"
                                    >
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                    <button 
                                        onClick={() => handleClaim(subject._id)}
                                        className="btn-primary py-2.5 px-6 shadow-indigo-500/20 shadow-md font-bold shrink-0"
                                    >
                                        Claim
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Class Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Class</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5"/></button>
                        </div>
                        <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                                <input type="text" required value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent dark:text-white" placeholder="e.g. Advanced AI" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                                <input type="text" required value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent dark:text-white" placeholder="e.g. CS601" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Course Program</label>
                                <select required value={newSubject.course} onChange={e => setNewSubject({...newSubject, course: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent dark:text-white">
                                    {courses.map(c => <option key={c._id} value={c._id} className="text-slate-800">{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                                <input type="number" min="1" max="10" required value={newSubject.semester} onChange={e => setNewSubject({...newSubject, semester: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent dark:text-white" placeholder="1-8" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Timing</label>
                                <input type="text" required value={newSubject.timing} onChange={e => setNewSubject({...newSubject, timing: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent dark:text-white" placeholder="e.g. Mon, Wed 10:00 AM - 11:30 AM" />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition">Create & Claim</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default FacultyAvailableClasses;
