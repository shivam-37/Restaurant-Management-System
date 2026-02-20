import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { getAnalytics } from '../../services/api';
import Menu from './Menu';
import Orders from './Orders';
import Settings from './Settings';
import {
    HomeIcon,
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    const [analytics, setAnalytics] = useState({
        totalOrders: 0,
        activeOrders: 0,
        totalSales: 0,
        newCustomers: 0
    });

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        } else if (user) {
            fetchAnalytics();
        }
    }, [user, loading, navigate]);

    const fetchAnalytics = async () => {
        try {
            const { data } = await getAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch analytics");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    const navItems = [
        { name: 'Overview', icon: HomeIcon },
        { name: 'Menu', icon: ClipboardDocumentListIcon },
        { name: 'Orders', icon: ChartBarIcon },
        { name: 'Customers', icon: UsersIcon },
        { name: 'Settings', icon: Cog6ToothIcon },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-10 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        RestoManager
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.name
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`h-6 w-6 mr-3 ${activeTab === item.name ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                                }`} />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="mt-2 w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{activeTab}</h2>
                        <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
                    </div>
                </header>

                {/* Dashboard Stats */}
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Sales', value: `$${analytics.totalSales}`, color: 'indigo' },
                            { label: 'Active Orders', value: analytics.activeOrders, color: 'purple' },
                            { label: 'Total Orders', value: analytics.totalOrders, color: 'green' },
                            { label: 'New Customers', value: analytics.newCustomers, color: 'orange' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Render Active Tab Content */}
                {activeTab === 'Menu' && <Menu />}
                {activeTab === 'Orders' && <Orders />}
                {activeTab === 'Settings' && <Settings />}
                {activeTab === 'Customers' && <div className="p-4 text-center text-gray-500">Customer Management Coming Soon</div>}

                {/* Content Placeholder for Overview */}
                {activeTab === 'Overview' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex items-center justify-center text-gray-400">
                        Chart visuals would go here
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
