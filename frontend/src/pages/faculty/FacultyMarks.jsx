import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { FileText, Trash2 } from 'lucide-react';

const FacultyMarks = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [examName, setExamName] = useState('');
    const [semester, setSemester] = useState('');
    const [marksObtained, setMarksObtained] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [isAbsent, setIsAbsent] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadedMarks, setUploadedMarks] = useState([]);
    const [filterExamType, setFilterExamType] = useState('');
    const [editMarkId, setEditMarkId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const subRes = await axios.get('http://localhost:5000/api/faculty/subjects', config);
                
                setSubjects(subRes.data);
                if (subRes.data.length > 0) {
                    setSelectedSubject(subRes.data[0]._id);
                    setSemester(subRes.data[0].semester || '');
                    fetchStudents(subRes.data[0].course?._id || subRes.data[0].course, config);
                }
                fetchUploadedMarks();
            } catch (error) {
                console.error(error);
            }
        };
        fetchInitialData();
    }, []);

    const fetchUploadedMarks = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/faculty/marks', config);
            setUploadedMarks(data);
        } catch (error) {
            console.error(error);
        }
    };

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
            setSemester(sub.semester || '');
            fetchStudents(sub.course._id || sub.course, config);
        } else {
            setSemester('');
            setStudents([]);
            setSelectedStudent('');
        }
    };

    const handleEdit = (record) => {
        setEditMarkId(record._id);
        setSelectedSubject(record.subject?._id);
        setSelectedStudent(record.student?._id);
        setExamName(record.examName);
        setSemester(record.semester);
        setMarksObtained(record.isAbsent ? '' : record.marksObtained);
        setTotalMarks(record.totalMarks);
        setIsAbsent(record.isAbsent || false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditMarkId(null);
        setExamName('');
        setSemester('');
        setMarksObtained('');
        setTotalMarks('');
        setIsAbsent(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAbsent && Number(marksObtained) > Number(totalMarks)) {
            alert('Marks obtained cannot be greater than total marks');
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const payload = {
                studentId: selectedStudent,
                subjectId: selectedSubject,
                examName,
                semester: Number(semester),
                marksObtained: isAbsent ? 0 : Number(marksObtained),
                totalMarks: Number(totalMarks),
                isAbsent
            };

            if (editMarkId) {
                await axios.put(`http://localhost:5000/api/faculty/marks/${editMarkId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                setMessage('Marks updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/faculty/marks', payload, { headers: { Authorization: `Bearer ${token}` } });
                setMessage('Marks uploaded successfully!');
            }
            
            setExamName(''); setSemester(''); setMarksObtained(''); setTotalMarks(''); setIsAbsent(false); setEditMarkId(null);
            fetchUploadedMarks();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert(`Failed to ${editMarkId ? 'update' : 'upload'} marks`);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            await axios.delete(`http://localhost:5000/api/faculty/marks/${deleteConfirmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUploadedMarks();
            setMessage('Marks deleted successfully!');
            setDeleteConfirmId(null);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete marks');
            setDeleteConfirmId(null);
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
                            <select className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400" value={selectedSubject} onChange={e => handleSubjectChange(e.target.value)} required disabled={!!editMarkId}>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required disabled={!!editMarkId}>
                                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                            <select required value={examName} onChange={e => setExamName(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400" disabled={!!editMarkId}>
                                <option value="" disabled>Select Exam</option>
                                <option value="1st internal">1st internal</option>
                                <option value="2nd internal">2nd internal</option>
                                <option value="Sem exam">Sem exam</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester (Auto-filled)</label>
                            <select required value={semester} onChange={e => setSemester(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 text-gray-500 cursor-not-allowed" disabled>
                                <option value="" disabled>Select Semester</option>
                                {[1,2,3,4,5,6,7,8,9,10].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                            <input type="number" required={!isAbsent} disabled={isAbsent} value={isAbsent ? '' : marksObtained} onChange={e => setMarksObtained(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                            <input type="number" required value={totalMarks} onChange={e => setTotalMarks(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isAbsent" checked={isAbsent} onChange={e => setIsAbsent(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="isAbsent" className="text-sm font-medium text-gray-700">Student was absent for the exam</label>
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm flex items-center justify-center">
                            <FileText className="w-5 h-5 mr-2" /> {editMarkId ? 'Update Results' : 'Upload Results'}
                        </button>
                        {editMarkId && (
                            <button type="button" onClick={cancelEdit} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium shadow-sm">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 gap-4">
                    <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Uploaded Marks</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">Filter View:</label>
                        <select 
                            value={filterExamType} 
                            onChange={(e) => setFilterExamType(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700"
                        >
                            <option value="">-- Select Exam Type --</option>
                            <option value="1st internal">1st internal</option>
                            <option value="2nd internal">2nd internal</option>
                            <option value="Sem exam">Sem exam</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Obtained</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filterExamType === '' ? (
                                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500 font-medium">Please select an exam type to view uploaded marks.</td></tr>
                            ) : uploadedMarks.filter(m => m.examName === filterExamType).length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No marks uploaded for this exam type yet.</td></tr>
                            ) : (
                                uploadedMarks.filter(m => m.examName === filterExamType).map((record) => (
                                    <tr key={record._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.student?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.subject?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.semester}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.examName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{record.isAbsent ? 'Absent' : record.marksObtained}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.totalMarks}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(record)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => setDeleteConfirmId(record._id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 className="w-5 h-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl text-center">
                        <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Delete Marks?</h2>
                        <p className="text-gray-500 mb-6">Are you sure you want to permanently delete these marks?</p>
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

export default FacultyMarks;
