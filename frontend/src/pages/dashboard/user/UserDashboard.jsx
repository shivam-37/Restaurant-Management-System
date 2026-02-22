import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalytics } from '../../../services/api';
import Menu from '../Menu';
import Orders from '../Orders';
import Settings from '../Settings';
import NotificationTray from '../NotificationTray';
import {
    HomeIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    ClipboardDocumentListIcon,
    BellIcon,
    ChevronDownIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    ClockIcon,
    SparklesIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const UserDashboard = ({ user, logout }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalOrders: 0,
        activeOrders: 0,
        totalSales: 0 // For User, this is total spent
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const { data } = await getAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch user analytics");
        }
    };

    const navItems = [
        { name: 'Overview', icon: HomeIcon, color: 'from-blue-500 to-cyan-500' },
        { name: 'Menu', icon: ClipboardDocumentListIcon, color: 'from-purple-500 to-pink-500' },
        { name: 'My Orders', icon: ShoppingBagIcon, color: 'from-green-500 to-emerald-500' },
        { name: 'Reservations', icon: CalendarIcon, color: 'from-orange-500 to-red-500' },
        { name: 'Settings', icon: Cog6ToothIcon, color: 'from-gray-500 to-gray-600' },
    ];

    const stats = [
        {
            label: 'Total Spent',
            value: `$${analytics.totalSales}`,
            icon: CurrencyDollarIcon,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
            textColor: 'text-green-400'
        },
        {
            label: 'Active Orders',
            value: analytics.activeOrders,
            icon: ClockIcon,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
            textColor: 'text-blue-400'
        },
        {
            label: 'Total Orders',
            value: analytics.totalOrders,
            icon: ShoppingBagIcon,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
            textColor: 'text-purple-400'
        }
    ];

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-40 left-20 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            <motion.aside initial={{ x: -100 }} animate={{ x: 0 }} className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800/50 z-20 hidden md:flex flex-col backdrop-blur-xl">
                <div className="p-6 border-b border-gray-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">RestoGuest</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`relative w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === item.name ? 'text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {activeTab === item.name && (
                                <motion.div layoutId="activeTab" className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20 rounded-xl`} />
                            )}
                            <item.icon className="h-6 w-6 mr-3 relative z-10" />
                            <span className="font-medium relative z-10">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800/50">
                    <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0)}</div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-400">Guest</p>
                        </div>
                    </button>
                    {isProfileMenuOpen && (
                        <button onClick={logout} className="mt-2 w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl">
                            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" /> Sign Out
                        </button>
                    )}
                </div>
            </motion.aside>

            <main className="flex-1 md:ml-72 relative overflow-y-auto">
                <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800/50 px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{activeTab}</h1>
                        <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
                    </div>
                    <NotificationTray />
                </header>

                <div className="p-8">
                    {activeTab === 'Overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800">
                                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <stat.icon className={`w-8 h-8 mt-4 text-indigo-400`} />
                                </div>
                            ))}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            {activeTab === 'Menu' && <Menu />}
                            {(activeTab === 'My Orders' || activeTab === 'Orders') && <Orders />}
                            {activeTab === 'Settings' && <Settings />}
                            {activeTab === 'Reservations' && (
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 p-12 text-center">
                                    <CalendarIcon className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">My Reservations</h3>
                                    <p className="text-gray-400">Coming Soon</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
