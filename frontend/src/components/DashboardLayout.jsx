import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, BookOpen, Clock, FileText, 
    Bell, Settings, LogOut, Menu, X, Search, Moon, Sun, 
    ChevronLeft, ChevronRight, UserPlus
} from 'lucide-react';

const DashboardLayout = ({ children, title, subtitle }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    
    useEffect(() => {
        const fetchNotices = async () => {
             if (!user?.role) return;
             try {
                 const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                 const { data } = await axios.get(`http://localhost:5000/api/${user.role.toLowerCase()}/notices`, {
                     headers: { Authorization: `Bearer ${token}` }
                 });
                 setNotifications(data);
             } catch (error) {
                 console.error(error);
             }
        };
        fetchNotices();
    }, [user]);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        switch (user?.role) {
            case 'Admin':
                return [
                    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
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
                    { name: 'Study Materials', icon: FileText, path: '/faculty/materials' },
                ];
            case 'Student':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
                    { name: 'Attendance', icon: Clock, path: '/student/attendance' },
                    { name: 'Marks', icon: FileText, path: '/student/marks' },
                    { name: 'Study Materials', icon: BookOpen, path: '/student/materials' },
                ];
            default: return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden font-sans">
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                className="hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative z-20"
            >
                <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen ? (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                className="flex items-center space-x-3 font-bold text-2xl gradient-text whitespace-nowrap overflow-hidden"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-md">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span>Edge</span>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mx-auto shadow-md"
                            >
                                E
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 overflow-y-auto py-8 flex flex-col gap-2 px-4">
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3">
                        {isSidebarOpen ? 'Menu' : '—'}
                    </div>
                    {navItems.map((item) => (
                        <NavLink key={item.path} to={item.path} end={['/admin', '/faculty', '/student'].includes(item.path)}
                            className={({ isActive }) => 
                                `relative flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group ${
                                    isActive 
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                                }`
                            }
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                            <AnimatePresence mode="wait">
                                {isSidebarOpen && (
                                    <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap overflow-hidden">
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 relative">
                    <NavLink to="/settings" className={({ isActive }) => 
                        `flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'}`
                    }>
                        <Settings className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                        {isSidebarOpen && <span className="whitespace-nowrap font-medium">Settings</span>}
                    </NavLink>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 font-medium group">
                        <LogOut className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                        {isSidebarOpen && <span className="whitespace-nowrap">Logout</span>}
                    </button>
                    
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)} 
                        className="absolute -right-4 top-[-20px] w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 shadow-sm z-30 transition-transform"
                    >
                        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header and View */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 transition-colors">
                    <div className="flex items-center">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mr-4 text-slate-500 hover:text-indigo-600 transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        <div className="hidden sm:flex items-center bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-64 lg:w-96 focus-within:w-80 lg:focus-within:w-[450px] transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 group">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors mr-3" />
                            <input type="text" placeholder="Search systems, directories..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-6">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
                        </button>
                        
                        <div className="relative">
                            <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="relative w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>}
                            </button>
                            
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 p-2"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No new notifications</div>
                                            ) : (
                                                notifications.map(notice => (
                                                    <div key={notice._id} className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors last:border-0 rounded-xl">
                                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{notice.title}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{notice.content}</p>
                                                        <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-2 font-semibold uppercase tracking-wider">
                                                            {new Date(notice.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
                        <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name || "Loading..."}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{user?.role || "User"}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 border border-white/20">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full max-w-7xl mx-auto flex flex-col min-h-full">
                        {(title || subtitle) && (
                            <div className="mb-8 lg:mb-10">
                                {title && <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>}
                                {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">{subtitle}</p>}
                            </div>
                        )}
                        <div className="flex-1 w-full">
                            {children}
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* Mobile Sidebar Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" />
                        <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col md:hidden">
                            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center space-x-3 font-bold text-2xl gradient-text">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-md">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <span>Edge</span>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-8 px-5 space-y-2">
                                {navItems.map((item) => (
                                    <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} end={['/admin', '/faculty', '/student'].includes(item.path)}
                                        className={({ isActive }) => `flex items-center px-5 py-4 rounded-2xl transition-all font-semibold ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                    >
                                        <item.icon className="w-5 h-5 mr-4" />
                                        {item.name}
                                    </NavLink>
                                ))}
                            </div>
                            <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center px-5 py-4 rounded-2xl transition-all font-semibold ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                    <Settings className="w-5 h-5 mr-4" /> Settings
                                </NavLink>
                                <button onClick={handleLogout} className="w-full flex items-center px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-semibold">
                                    <LogOut className="w-5 h-5 mr-4" /> Logout
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;
