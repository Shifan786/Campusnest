import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Clock, FileText, Settings, Bell, UserPlus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    const getLinks = () => {
        if (!user) return [];
        switch (user.role) {
            case 'Admin':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
                    { name: 'Users', icon: Users, path: '/admin/users' },
                    { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
                    { name: 'Enrollments', icon: UserPlus, path: '/admin/enrollments' },
                    { name: 'Notices', icon: Bell, path: '/admin/notices' },
                ];
            case 'Faculty':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, path: '/faculty' },
                    { name: 'Available Classes', icon: BookOpen, path: '/faculty/available-classes' },
                    { name: 'My Classes', icon: Users, path: '/faculty/classes' },
                    { name: 'Attendance', icon: Clock, path: '/faculty/attendance' },
                    { name: 'Marks', icon: FileText, path: '/faculty/marks' },
                ];
            case 'Student':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
                    { name: 'Attendance', icon: Clock, path: '/student/attendance' },
                    { name: 'Marks', icon: FileText, path: '/student/marks' },
                ];
            default:
                return [];
        }
    };

    const links = getLinks();

    return (
        <div className="w-64 bg-indigo-900 text-white min-h-screen flex flex-col shadow-xl">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-wider flex items-center">
                    <BookOpen className="mr-3 w-8 h-8 text-indigo-300" />
                    ERP
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        end
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                isActive 
                                    ? 'bg-indigo-800 text-white border-l-4 border-indigo-400' 
                                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                            }`
                        }
                    >
                        <link.icon className="mr-3 w-5 h-5 opacity-75" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>
            <NavLink to="/settings" className={({ isActive }) => 
                `flex items-center p-4 border-t border-indigo-800 text-sm font-medium transition-colors ${
                    isActive ? 'text-white bg-indigo-800' : 'text-indigo-300 hover:text-white hover:bg-indigo-800'
                }`
            }>
                <Settings className="w-5 h-5 mr-3" />
                Settings
            </NavLink>
        </div>
    );
};

export default Sidebar;
