import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Users } from 'lucide-react';

const FacultyClasses = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/faculty/subjects', config);
                setSubjects(data);
                if (data.length > 0) {
                    setSelectedSubject(data[0]);
                    fetchStudents(data[0].course._id, config);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchSubjects();
    }, []);

    const fetchStudents = async (courseId, config) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/faculty/students/${courseId}`, config);
            setStudents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubjectChange = (subjectId) => {
        const sub = subjects.find(s => s._id === subjectId);
        setSelectedSubject(sub);
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        if (sub && sub.course) {
            fetchStudents(sub.course._id, config);
        } else {
            setStudents([]);
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Classes & Students</h1>
                <p className="text-gray-500 mt-2">View the students enrolled in your subjects.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject Cluster</label>
                <select 
                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={e => handleSubjectChange(e.target.value)}
                    value={selectedSubject ? selectedSubject._id : ''}
                >
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50">
                    <Users className="w-5 h-5 mr-2 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Enrolled Students in {selectedSubject?.course?.name || 'Class'}</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment No.</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.length === 0 ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No students found in this course.</td></tr>
                        ) : (
                            students.map((stu) => (
                                <tr key={stu._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{stu.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{stu.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{stu.enrollmentNumber || 'N/A'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default FacultyClasses;
