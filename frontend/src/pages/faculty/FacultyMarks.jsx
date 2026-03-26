import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { FileText } from 'lucide-react';

const FacultyMarks = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [examName, setExamName] = useState('');
    const [marksObtained, setMarksObtained] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
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
                    fetchStudents(subRes.data[0].course?._id || subRes.data[0].course, config);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchInitialData();
    }, []);

    const fetchStudents = async (courseId, config) => {
        if (!courseId) return;
        try {
            const { data } = await axios.get(`http://localhost:5000/api/faculty/students/${courseId}`, config);
            setStudents(data);
            if (data.length > 0) setSelectedStudent(data[0]._id);
            else setSelectedStudent('');
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
            fetchStudents(sub.course._id || sub.course, config);
        } else {
            setStudents([]);
            setSelectedStudent('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            await axios.post('http://localhost:5000/api/faculty/marks', {
                studentId: selectedStudent,
                subjectId: selectedSubject,
                examName,
                marksObtained: Number(marksObtained),
                totalMarks: Number(totalMarks)
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setMessage('Marks uploaded successfully!');
            setExamName(''); setMarksObtained(''); setTotalMarks('');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert('Failed to upload marks');
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upload Marks</h1>
                <p className="text-gray-500 mt-2">Enter assessment results for students in your subjects.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSubject} onChange={e => handleSubjectChange(e.target.value)} required>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                        <input type="text" required value={examName} onChange={e => setExamName(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Midterm 1" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                            <input type="number" required value={marksObtained} onChange={e => setMarksObtained(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                            <input type="number" required value={totalMarks} onChange={e => setTotalMarks(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm flex items-center justify-center">
                        <FileText className="w-5 h-5 mr-2" /> Upload Results
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default FacultyMarks;
