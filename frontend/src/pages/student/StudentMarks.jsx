import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { FileText } from 'lucide-react';

const StudentMarks = () => {
    const [marks, setMarks] = useState([]);

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/student/marks', config);
                setMarks(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMarks();
    }, []);

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Academic Marks</h1>
                <p className="text-gray-500 mt-2">Check your examination results and grades.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50">
                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Exam Results</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Obtained</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {marks.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No examination records found.</td></tr>
                        ) : (
                            marks.map((record) => {
                                const percentage = record.isAbsent ? 0 : Math.round((record.marksObtained / record.totalMarks) * 100);
                                return (
                                    <tr key={record._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.examName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.subject?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{record.isAbsent ? 'Absent' : record.marksObtained}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.totalMarks}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {record.isAbsent ? (
                                                <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-800">
                                                    N/A
                                                </span>
                                            ) : (
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                    percentage >= 75 ? 'bg-green-100 text-green-800' :
                                                    percentage >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {percentage}%
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default StudentMarks;
