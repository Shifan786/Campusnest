import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const AdminEnrollments = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/enrollments/pending', config);
            setPending(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (id, action) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/admin/enrollments/${id}/${action}`, {}, config);
            fetchPending();
        } catch (error) {
            alert(`Failed to ${action} enrollment`);
        }
    };

    return (
        <DashboardLayout title="Enrollment Approvals" subtitle="Review and approve student course applications">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pending Requests</h2>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800">
                        {pending.length} Pending
                    </span>
                </div>
                
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading requests...</div>
                ) : pending.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
                        <p className="text-slate-500 font-medium">There are no pending student enrollment requests.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Course</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800/50">
                            {pending.map((req) => (
                                <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-slate-900 dark:text-white">{req.name}</div>
                                        {req.enrollmentNumber && <div className="text-xs text-slate-500 mt-1">{req.enrollmentNumber}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">{req.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-bold rounded-lg border border-indigo-100 dark:border-indigo-800">
                                            {req.course?.name || 'Unknown Course'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleAction(req._id, 'reject')}
                                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition"
                                                title="Reject Request"
                                            >
                                                <XCircle className="w-6 h-6" />
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req._id, 'approve')}
                                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-500/20 transition flex items-center"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminEnrollments;
