import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import { getAnalytics, predictInventory } from '../../../services/api';
import RestaurantManagement from './RestaurantManagement';
import Orders from '../Orders';
import Settings from '../Settings';
import Customers from './Customers';
import Analytics from './Analytics';
import KitchenDisplay from './KitchenDisplay';
import TableMap from './TableMap';
import Reservations from '../Reservations';
import UserManagement from './UserManagement';
import NotificationTray from '../NotificationTray';
import {
    HomeIcon,
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    ClipboardDocumentListIcon,
    BellIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    ClockIcon,
    UserGroupIcon,
    SparklesIcon,
    FireIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    MapIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    CalendarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

import AuthContext from '../../../context/AuthContext';
import { useContext } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

// Main administration console
const AdminDashboard = () => {
    const { user, logout, selectedRestaurant, setSelectedRestaurant } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('Overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalOrders: 0,
        activeOrders: 0,
        totalSales: 0,
        newCustomers: 0
    });
    const [predictions, setPredictions] = useState([]);
    const [isPredicting, setIsPredicting] = useState(false);

    useEffect(() => {
        fetchAnalytics();
        fetchAIPredictions();
    }, [selectedRestaurant?._id]);

    const fetchAIPredictions = async () => {
        setIsPredicting(true);
        try {
            const { data } = await predictInventory(selectedRestaurant?._id);
            setPredictions(data);
        } catch (error) {
            console.error("AI Prediction failed");
        } finally {
            setIsPredicting(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const { data } = await getAnalytics(selectedRestaurant?._id);
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch analytics");
        }
    };

    const navItems = [
        { name: 'Overview', icon: HomeIcon, color: 'from-blue-500 to-cyan-500' },
        { name: 'Restaurants', icon: ClipboardDocumentListIcon, color: 'from-purple-500 to-pink-500' },
        { name: 'Kitchen', icon: FireIcon, color: 'from-orange-500 to-red-500' },
        { name: 'Table Map', icon: MapIcon, color: 'from-blue-500 to-rose-500' },
        { name: 'Orders', icon: ShoppingBagIcon, color: 'from-green-500 to-emerald-500' },
        { name: 'Reservations', icon: CalendarIcon, color: 'from-yellow-500 to-rose-500' },
        { name: 'Customers', icon: UsersIcon, color: 'from-orange-500 to-red-500' },
        { name: 'System Users', icon: ShieldCheckIcon, color: 'from-indigo-500 to-purple-500' },
        { name: 'Analytics', icon: ChartBarIcon, color: 'from-rose-500 to-purple-500' },
        { name: 'Settings', icon: Cog6ToothIcon, color: 'from-gray-500 to-gray-600' },
    ];

    const stats = [
        {
            label: 'Total Sales',
            value: `₹${(analytics.totalSales || 0).toLocaleString()}`,
            change: '+12.5%',
            icon: CurrencyDollarIcon,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-600 dark:text-green-400'
        },
        {
            label: 'Active Orders',
            value: analytics.activeOrders,
            change: '+8.2%',
            icon: ClockIcon,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Total Orders',
            value: analytics.totalOrders,
            change: '+23.1%',
            icon: ShoppingBagIcon,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-600 dark:text-purple-400'
        },
        {
            label: 'New Customers',
            value: analytics.newCustomers,
            change: '+5.7%',
            icon: UserGroupIcon,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            textColor: 'text-orange-600 dark:text-orange-400'
        }
    ];

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-40 w-[500px] h-[500px] bg-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-40 left-20 w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className={`fixed inset-y-0 left-0 w-72 z-20 hidden md:flex flex-col backdrop-blur-xl border-r`}
                style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}
            >
                <div className="p-6 border-b border-gray-800/50">
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-purple-500 rounded-xl blur-lg opacity-50"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-rose-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">Admin Panel</span>
                    </motion.div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.button
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setActiveTab(item.name)}
                                className={`relative w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${activeTab === item.name ? 'text-rose-600 dark:text-white' : 'opacity-50 hover:opacity-100'
                                    }`}
                            >
                                {activeTab === item.name && (
                                    <motion.div layoutId="activeTab" className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10`} transition={{ type: "spring", duration: 0.5 }} />
                                )}
                                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <div className={`absolute left-0 w-1 h-8 bg-gradient-to-b ${item.color} rounded-r-full transition-all duration-200 ${activeTab === item.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                                <Icon className={`h-6 w-6 mr-3 relative z-10 transition-colors ${activeTab === item.name ? 'text-rose-500' : 'opacity-60 group-hover:opacity-100'}`} />
                                <span className="font-bold relative z-10 text-sm tracking-tight">{item.name}</span>
                            </motion.button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-black/5 dark:border-white/5">
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/20 overflow-hidden shrink-0">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || 'A'
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-bold truncate">{user?.name}</p>
                                <p className="text-xs opacity-50 truncate">Admin Panel</p>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 opacity-40 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                        </motion.button>
                        <AnimatePresence>
                            {isProfileMenuOpen && (
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute bottom-full left-0 w-full mb-2 theme-card rounded-xl border border-black/5 shadow-2xl overflow-hidden">
                                    <button onClick={logout} className="w-full flex items-center px-4 py-3 text-sm text-orange-500 hover:bg-orange-500/5 transition font-bold">
                                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" /> Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            <main className={`flex-1 md:ml-72 relative overflow-y-auto`}>
                <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'var(--navbar-bg)', borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between px-8 py-4">
                        <div>
                            <motion.h1 key={activeTab} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">{activeTab}</motion.h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{selectedRestaurant ? selectedRestaurant.name : 'System Status'}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                                {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                            </button>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-xl w-64 border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                            </div>
                            <NotificationTray />
                        </div>
                    </div>
                </motion.header>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'Overview' && (
                                <div className="space-y-8">
                                    {/* Selected Restaurant Profile Header */}
                                    {selectedRestaurant && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="theme-card bg-rose-600/5 border border-rose-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6"
                                        >
                                            <div className="w-20 h-20 bg-rose-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-rose-600/20 text-white">
                                                {selectedRestaurant.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                                    <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedRestaurant.name}</h2>
                                                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20">Active Restaurant</span>
                                                </div>
                                                <p className="opacity-60 text-sm max-w-xl font-medium">{selectedRestaurant.description || "No description provided for this restaurant."}</p>
                                                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                                                    <div className="flex items-center gap-1 text-xs text-rose-500 font-bold uppercase tracking-wide">
                                                        <MapIcon className="w-3.5 h-3.5" />
                                                        {selectedRestaurant.address}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-rose-500 font-bold uppercase tracking-wide">
                                                        <FireIcon className="w-3.5 h-3.5" />
                                                        {selectedRestaurant.cuisine} Cuisine
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // This resets the state and shows global platform view
                                                    setSelectedRestaurant(null);
                                                }}
                                                className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition active:scale-95"
                                            >
                                                All Restaurants
                                            </button>
                                        </motion.div>
                                    )}

                                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {stats.map((stat, idx) => {
                                            const Icon = stat.icon;
                                            return (
                                                <motion.div key={idx} variants={fadeInUp} whileHover={{ y: -4 }} className="group relative theme-card rounded-2xl p-6 hover:border-rose-500/30 transition-all duration-300 overflow-hidden">
                                                    <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                                    <div className="flex items-start justify-between relative z-10">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
                                                            <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                                                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${stat.textColor}`}>{stat.change}</p>
                                                        </div>
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg shadow-rose-500/20 flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>

                                    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="theme-card rounded-[2.5rem] p-8 border border-black/5 shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none"></div>
                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-rose-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/20 text-white">
                                                    <SparklesIcon className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Stock Prediction AI</h2>
                                                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Stock Prediction AI</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={fetchAIPredictions}
                                                disabled={isPredicting}
                                                className="p-3 theme-card-item rounded-xl border border-black/5 hover:border-rose-500 transition group"
                                            >
                                                <ArrowPathIcon className={`w-5 h-5 text-rose-500 group-hover:rotate-180 transition-transform duration-500 ${isPredicting ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>

                                        {isPredicting ? (
                                            <div className="space-y-4 relative z-10">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="h-20 bg-rose-500/5 rounded-2xl animate-pulse"></div>
                                                ))}
                                            </div>
                                        ) : predictions.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                                {predictions.map((p, idx) => (
                                                    <div key={idx} className="theme-card-item border border-black/5 p-6 rounded-2xl group hover:border-rose-500/30 transition-all shadow-sm">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <h4 className="font-bold">{p.name}</h4>
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.risk === 'High' ? 'bg-orange-500/10 text-orange-500 border border-red-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                                }`}>
                                                                {p.risk} Risk
                                                            </span>
                                                        </div>
                                                        <p className="text-xs opacity-60 mb-4 line-clamp-2 leading-relaxed font-medium">{p.reason}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-500/5 p-2 rounded-lg">
                                                            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                                            {p.recommendation}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 theme-card-item rounded-2xl border border-black/5 border-dashed relative z-10">
                                                <CheckCircleIcon className="h-14 w-14 opacity-10 mx-auto mb-4" />
                                                <p className="opacity-40 font-bold uppercase tracking-widest text-xs">Inventory levels are optimal</p>
                                            </div>
                                        )}
                                    </motion.div>
                                    {/* Multi-Establishment Performance Table (Platform View Only) */}
                                    {!selectedRestaurant && analytics.restaurantStats && analytics.restaurantStats.length > 0 && (
                                        <motion.div variants={fadeInUp} className="theme-card rounded-[2.5rem] border border-black/5 shadow-2xl overflow-hidden">
                                            <div className="p-8 border-b border-black/5 flex items-center justify-between bg-rose-500/5">
                                                <div>
                                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Restaurant Stats</h2>
                                                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Compare restaurant performance</p>
                                                </div>
                                                <button
                                                    onClick={() => setActiveTab('Restaurants')}
                                                    className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                                            <th className="px-8 py-5">Restaurant</th>
                                                            <th className="px-8 py-5">Volume</th>
                                                            <th className="px-8 py-5">Active</th>
                                                            <th className="px-8 py-5 text-right">Revenue</th>
                                                            <th className="px-8 py-5 text-center">Manage</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-black/5">
                                                        {analytics.restaurantStats.map((stat) => (
                                                            <tr key={stat.id} className="group hover:bg-black/5 transition-all">
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-500/20">
                                                                            {stat.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black uppercase tracking-wider">{stat.name}</p>
                                                                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{stat.cuisine} Cuisine</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className="text-sm font-bold opacity-60 tracking-tighter">{stat.totalOrders} Orders</span>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.activeOrders > 0 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' : 'opacity-20'}`}>
                                                                        {stat.activeOrders} Active
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <span className="text-sm font-black text-green-600 dark:text-green-400 tracking-tighter">₹{(stat.totalSales || 0).toLocaleString()}</span>
                                                                </td>
                                                                <td className="px-8 py-6 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedRestaurant(stat);
                                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                        }}
                                                                        className="p-3 opacity-20 group-hover:opacity-100 theme-card-item border border-black/5 hover:border-rose-500 hover:text-rose-500 rounded-xl transition-all"
                                                                    >
                                                                        <ArrowRightIcon className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}

                                    <Analytics />
                                </div>
                            )}
                            {activeTab === 'Restaurants' && <RestaurantManagement onSelect={setActiveTab} />}
                            {activeTab === 'Orders' && <Orders />}
                            {activeTab === 'Reservations' && <Reservations />}
                            {activeTab === 'Kitchen' && <KitchenDisplay />}
                            {activeTab === 'Table Map' && <TableMap />}
                            {activeTab === 'Settings' && <Settings />}
                            {activeTab === 'Customers' && <Customers />}
                            {activeTab === 'System Users' && <UserManagement />}
                            {activeTab === 'Analytics' && <Analytics />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
