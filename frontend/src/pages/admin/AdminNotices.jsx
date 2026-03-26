import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Bell, Edit2, Trash2, X, CheckSquare } from 'lucide-react';

const AdminNotices = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetAudience, setTargetAudience] = useState('All');
    
    const [notices, setNotices] = useState([]);
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);

    const fetchNotices = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/notices', config);
            setNotices(data);
        } catch (error) {
            console.error('Error fetching notices', error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setTargetAudience('All');
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (editingId) {
                await axios.put(`http://localhost:5000/api/admin/announcements/${editingId}`, { title, content, targetAudience }, config);
                setMessage('Notice updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/admin/announcements', { title, content, targetAudience }, config);
                setMessage('Notice published successfully!');
            }
            
            resetForm();
            setTimeout(() => setMessage(''), 3000);
            fetchNotices();
        } catch (error) {
            alert('Failed to save notice');
        }
    };

    const handleEdit = (notice) => {
        setEditingId(notice._id);
        setTitle(notice.title);
        setContent(notice.content);
        setTargetAudience(notice.targetAudience);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/admin/announcements/${id}`, config);
            setMessage('Notice deleted permanently.');
            setTimeout(() => setMessage(''), 3000);
            if (editingId === id) resetForm();
            fetchNotices();
        } catch (error) {
            alert('Failed to delete notice');
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Notice' : 'Broadcast Notice'}</h1>
                <p className="text-slate-500 mt-2">Publish announcements to students or faculty members.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 max-w-3xl mb-12">
                {message && <div className="mb-4 p-3 bg-emerald-100/50 border border-emerald-200 text-emerald-700 font-medium rounded-xl">{message}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notice Title</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white" placeholder="e.g. Mid-Term Schedule" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message Content</label>
                        <textarea required value={content} onChange={e => setContent(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-32 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white" placeholder="Write announcement..."></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Audience</label>
                        <select className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white" value={targetAudience} onChange={e => setTargetAudience(e.target.value)}>
                            <option value="All" className="text-slate-900">All Users</option>
                            <option value="Faculty" className="text-slate-900">Faculty Only</option>
                            <option value="Student" className="text-slate-900">Students Only</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-sm flex items-center justify-center">
                            {editingId ? <><CheckSquare className="w-5 h-5 mr-2" /> Update Notice</> : <><Bell className="w-5 h-5 mr-2" /> Publish Banner</>}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-bold flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Previous Notices</h2>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-full text-sm border border-indigo-100 dark:border-indigo-800">{notices.length} Total</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map((notice) => (
                    <div key={notice._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4 relative">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-lg text-xs tracking-wide uppercase">
                                {notice.targetAudience}
                            </span>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0 bg-white dark:bg-slate-900 pl-2">
                                <button onClick={() => handleEdit(notice)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(notice._id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">{notice.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm flex-1 leading-relaxed mb-4 line-clamp-3">{notice.content}</p>
                        <div className="mt-auto text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {new Date(notice.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))}
                
                {notices.length === 0 && (
                    <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                        <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">No notices published yet</h3>
                        <p className="text-slate-500 mt-1">Fill out the form above to broadcast your first announcement.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminNotices;
