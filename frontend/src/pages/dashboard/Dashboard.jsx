import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import OwnerDashboard from './owner/OwnerDashboard';
import UserDashboard from './user/UserDashboard';

const Dashboard = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-800 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    if (!user) return null;

    if (user.role === 'admin') {
        return <AdminDashboard user={user} logout={logout} />;
    }

    if (user.role === 'owner') {
        return <OwnerDashboard user={user} logout={logout} />;
    }

    return <UserDashboard user={user} logout={logout} />;
};

export default Dashboard;
