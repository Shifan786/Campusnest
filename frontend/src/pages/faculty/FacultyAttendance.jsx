import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Clock } from 'lucide-react';

const FacultyAttendance = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'Present' | 'Absent' }
    const [history, setHistory] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedHistoryDetails, setSelectedHistoryDetails] = useState([]);
    const [selectedHistoryInfo, setSelectedHistoryInfo] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const subRes = await axios.get('http://localhost:5000/api/faculty/subjects', config);
                setSubjects(subRes.data);
                if (subRes.data.length > 0) {
                    setSelectedSubject(subRes.data[0]._id);
                    fetchStudents(subRes.data[0].course._id, config);
                }
                fetchHistory(config);
            } catch (error) {
                console.error(error);
            }
        };
        fetchInitialData();
    }, []);

    const fetchHistory = async (config) => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/faculty/attendance/history', config);
            setHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleViewDetails = async (record) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const { data } = await axios.get(`http://localhost:5000/api/faculty/attendance/details?subjectId=${record._id.subject}&date=${record._id.date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedHistoryDetails(data);
            setSelectedHistoryInfo({ date: record._id.date, subjectName: record.subjectName });
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error fetching detailed attendance:', error);
            alert('Failed to fetch attendance details.');
        }
    };

    const fetchStudents = async (courseId, config) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/faculty/students/${courseId}`, config);
            setStudents(data);
            
            const initialAtt = {};
            data.forEach(s => { initialAtt[s._id] = 'Present'; });
            setAttendanceData(initialAtt);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubjectChange = (subjectId) => {
        setSelectedSubject(subjectId);
        const sub = subjects.find(s => s._id === subjectId);
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        if (sub && sub.course) {
            fetchStudents(sub.course._id, config);
        } else {
            setStudents([]);
            setAttendanceData({});
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            
            const records = students.map(s => ({
                studentId: s._id,
                status: attendanceData[s._id] || 'Absent'
            }));

            await axios.post('http://localhost:5000/api/faculty/attendance/bulk', {
                subjectId: selectedSubject,
                date,
                records
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setMessage('Bulk attendance saved successfully!');
            fetchHistory({ headers: { Authorization: `Bearer ${token}` } });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
            alert(errorMessage);
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mark Attendance (Bulk)</h1>
                <p className="text-gray-500 mt-2">All enrolled students are marked present by default. Click their row to toggle absence.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl">
                {message && <div className="mb-4 p-3 bg-green-100 text-green-700 font-medium rounded-lg">{message}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <select className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSubject} onChange={e => handleSubjectChange(e.target.value)} required>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" required value={date} min={new Date().toISOString().split('T')[0]} max={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden border border-gray-200 rounded-lg mb-6 max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map(s => (
                                    <tr key={s._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleAttendance(s._id)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={attendanceData[s._id] === 'Present'}
                                                    onChange={() => {}} 
                                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer pointer-events-none"
                                                />
                                                <span className={`ml-3 font-semibold ${attendanceData[s._id] === 'Present' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {attendanceData[s._id] === 'Present' ? 'Present' : 'Absent'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{s.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{s.email}</td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500 font-medium">No students enrolled in this course.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <button type="submit" disabled={students.length === 0} className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-medium shadow-sm flex items-center justify-center">
                        <Clock className="w-5 h-5 mr-2" /> Save Bulk Attendance
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 overflow-hidden max-w-4xl">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50">
                    <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Historical Attendance</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Present</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Absent</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No historical attendance found.</td></tr>
                            ) : (
                                history.map((record, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(record._id.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.subjectName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{record.presentCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-500">{record.absentCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button onClick={() => handleViewDetails(record)} className="text-indigo-600 hover:text-indigo-900 font-medium">View Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDetailsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Attendance Details</h2>
                            <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
                        </div>
                        {selectedHistoryInfo && (
                            <p className="text-gray-600 mb-4 text-sm">
                                <span className="font-semibold">{selectedHistoryInfo.subjectName}</span> on {new Date(selectedHistoryInfo.date).toLocaleDateString()}
                            </p>
                        )}
                        <div className="overflow-y-auto flex-1 border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedHistoryDetails.length === 0 ? (
                                        <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No records found.</td></tr>
                                    ) : (
                                        selectedHistoryDetails.map(detail => (
                                            <tr key={detail._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{detail.student?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.student?.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                    <span className={detail.status === 'Present' ? 'text-green-600' : 'text-red-500'}>
                                                        {detail.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default FacultyAttendance;
