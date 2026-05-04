import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { BookOpen, Plus } from 'lucide-react';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [totalSemesters, setTotalSemesters] = useState(8);
    const [editingCourseId, setEditingCourseId] = useState(null);

    const fetchCourses = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const { data } = await axios.get('http://localhost:5000/api/admin/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (editingCourseId) {
                await axios.put(`http://localhost:5000/api/admin/courses/${editingCourseId}`, { name, description, duration, totalSemesters: Number(totalSemesters) }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/admin/courses', { name, description, duration, totalSemesters: Number(totalSemesters) }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setName(''); setDescription(''); setDuration(''); setTotalSemesters(8); setEditingCourseId(null);
            fetchCourses();
        } catch (error) {
            alert('Failed to save course');
        }
    };

    const handleEdit = (course) => {
        setEditingCourseId(course._id);
        setName(course.name);
        setDuration(course.duration);
        setDescription(course.description);
        setTotalSemesters(course.totalSemesters || 8);
    };

    const cancelEdit = () => {
        setEditingCourseId(null);
        setName(''); setDescription(''); setDuration(''); setTotalSemesters(8);
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Courses</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-2">Add and view the courses offered.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
                            {editingCourseId ? <span className="text-indigo-600 dark:text-indigo-400">Edit Course</span> : <><Plus className="w-5 h-5 mr-2" /> New Course</>}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Course Name</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-transparent border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Bca" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Duration</label>
                                <input type="text" required value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 bg-transparent border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 4 Years" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Total Semesters</label>
                                <input type="number" min="1" max="10" required value={totalSemesters} onChange={e => setTotalSemesters(e.target.value)} className="w-full p-2 bg-transparent border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-transparent border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Course details..."></textarea>
                            </div>
                            <div className="flex space-x-3">
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm">
                                    {editingCourseId ? 'Save Changes' : 'Add Course'}
                                </button>
                                {editingCourseId && (
                                    <button type="button" onClick={cancelEdit} className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium shadow-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Course Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Semesters</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                                {courses.map(course => (
                                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white border-l-4 border-indigo-500">{course.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-400">{course.duration}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-400">{course.totalSemesters || 8}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 truncate max-w-xs">{course.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(course)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminCourses;
