import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 z-10 sticky top-0">
            <div className="flex items-center justify-between px-8 py-4">
                <div className="text-xl font-semibold text-gray-800 capitalize tracking-wide">
                    {user?.role} Portal
                </div>
                
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold uppercase">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 leading-tight">{user?.name}</span>
                            <span className="text-xs text-gray-500 leading-tight">{user?.email}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
