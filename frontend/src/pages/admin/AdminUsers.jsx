import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Trash2, UserPlus } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });

    const fetchUsers = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            await axios.delete(`http://localhost:5000/api/admin/users/${deleteConfirmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            setDeleteConfirmId(null);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to delete user');
            setDeleteConfirmId(null);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'Student' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-2">View, add, and remove system users.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition"
                >
                    <UserPlus className="w-5 h-5 mr-2" /> Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'Faculty' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button onClick={() => setDeleteConfirmId(user._id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-5 h-5 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Add New User</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input type="text" placeholder="Name" required className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setFormData({...formData, name: e.target.value})} />
                            <input type="email" placeholder="Email" required className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setFormData({...formData, email: e.target.value})} />
                            <input type="password" placeholder="Password" required className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setFormData({...formData, password: e.target.value})} />
                            <select value={formData.role} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="Student">Student</option>
                                <option value="Faculty">Faculty</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 font-medium text-white rounded-lg shadow-sm hover:bg-indigo-700 transition">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl text-center">
                        <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Delete User?</h2>
                        <p className="text-gray-500 mb-6">Are you sure you want to delete this user? All associated records will be permanently removed.</p>
                        <div className="flex justify-center space-x-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 font-medium text-white rounded-lg shadow-sm hover:bg-red-700 transition">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminUsers;
