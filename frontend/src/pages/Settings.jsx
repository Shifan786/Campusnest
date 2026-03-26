import React, { useState, useContext } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserCircle, Lock, Save } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useContext(AuthContext); 
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const { data } = await axios.put('http://localhost:5000/api/auth/profile', {
                name,
                email,
                password
            }, config);

            // Update local storage
            localStorage.setItem('userInfo', JSON.stringify(data));
            setMessage('Profile updated successfully. Refreshing UI...');
            setPassword('');
            setConfirmPassword('');
            
            // Reload page to dynamically sync headers/avatars
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-500 mt-2">Manage your personal profile and security preferences.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg font-medium">{message}</div>}
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg font-medium">{error}</div>}
                
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="border-b border-gray-100 pb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><UserCircle className="w-5 h-5 mr-2 text-indigo-500" /> Personal Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-100 pb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Lock className="w-5 h-5 mr-2 text-indigo-500" /> Security</h2>
                        <p className="text-sm text-gray-500 mb-4">Leave password fields blank if you do not wish to change your password.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" /> Save Changes
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default SettingsPage;
