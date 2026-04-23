import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileUp, Trash2, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const FacultyMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseId, setCourseId] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const [materialsRes, coursesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/materials/faculty', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/faculty/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setMaterials(materialsRes.data);
            setCourses(coursesRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load data');
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !courseId || !file) {
            setError('Please fill all required fields');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('course', courseId);
        formData.append('file', file);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            await axios.post('http://localhost:5000/api/materials/upload', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Reset form
            setTitle('');
            setDescription('');
            setCourseId('');
            setFile(null);
            
            // Refresh list
            fetchData();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to upload material');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            await axios.delete(`http://localhost:5000/api/materials/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(materials.filter(m => m._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete material');
        }
    };

    return (
        <DashboardLayout title="Study Materials" subtitle="Upload and manage study materials for your courses">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-fit"
                >
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center mb-6">
                        <FileUp className="w-5 h-5 mr-2 text-indigo-500" />
                        Upload Material
                    </h2>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center text-sm">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                placeholder="e.g. Chapter 1 Notes"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course *</label>
                            <select 
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                            >
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>{course.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white resize-none h-24"
                                placeholder="Optional description..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">File *</label>
                            <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-500/10 dark:file:text-indigo-400"
                            />
                            <p className="text-xs text-slate-500 mt-2">Max limit 10MB. Valid formats: pdf only.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={uploading}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-70"
                        >
                            {uploading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                            ) : (
                                "Upload Material"
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Materials List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center mb-6 px-2">
                        <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                        Your Uploaded Materials
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                    ) : materials.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No materials yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Upload your first study material using the form</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {materials.map((item, i) => (
                                <motion.div 
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <FileUp className="w-5 h-5" />
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(item._id)}
                                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.title}</h3>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mt-1">{item.course?.name}</p>
                                    {item.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{item.description}</p>
                                    )}
                                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                        <a href={`http://localhost:5000${item.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">View File</a>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FacultyMaterials;
