import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Download, FileText, Search, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const StudentMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState('All');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const { data } = await axios.get('http://localhost:5000/api/materials/student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // Extract unique course names for filter
    const courses = ['All', ...new Set(materials.map(m => m.course?.name).filter(Boolean))];

    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCourse = filterCourse === 'All' || material.course?.name === filterCourse;
        return matchesSearch && matchesCourse;
    });

    return (
        <DashboardLayout title="Study Materials" subtitle="Access resources uploaded by your faculty">
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search materials..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                    />
                </div>
                
                <select 
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="sm:w-48 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white cursor-pointer"
                >
                    {courses.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>
            ) : filteredMaterials.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No materials found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Adjust your search or check back later</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material, index) => (
                        <motion.div 
                            key={material._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col h-full group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                                    {material.course?.name || 'General'}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{material.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1 line-clamp-3">
                                {material.description || "No description provided."}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-400">
                                    By {material.uploadedBy?.name || 'Faculty'}
                                </span>
                                
                                <a 
                                    href={`http://localhost:5000${material.fileUrl}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-4 py-2 rounded-xl transition-colors font-semibold text-sm"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            
        </DashboardLayout>
    );
};

export default StudentMaterials;
