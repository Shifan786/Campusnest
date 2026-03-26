import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Clock } from 'lucide-react';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/student/attendance', config);
                setAttendance(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAttendance();
    }, []);

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Attendance Register</h1>
                <p className="text-gray-500 mt-2">View your detailed daily attendance history.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50">
                    <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Recent Attendance Logs</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attendance.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No attendance records found.</td></tr>
                        ) : (
                            attendance.map((record) => (
                                <tr key={record._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.subject?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.faculty?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                            record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                            record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default StudentAttendance;
