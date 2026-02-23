import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalytics, predictInventory } from '../../../services/api';
import RestaurantManagement from './RestaurantManagement';
import Orders from '../Orders';
import Settings from '../Settings';
import Customers from './Customers';
import Analytics from './Analytics';
import KitchenDisplay from './KitchenDisplay';
import TableMap from './TableMap';
import Reservations from '../Reservations';
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
    CalendarIcon
} from '@heroicons/react/24/outline';

import AuthContext from '../../../context/AuthContext';
import { useContext } from 'react';

// Main administration console
const AdminDashboard = () => {
    const { user, logout, selectedRestaurant, setSelectedRestaurant } = useContext(AuthContext);
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
        { name: 'Table Map', icon: MapIcon, color: 'from-blue-500 to-indigo-500' },
        { name: 'Orders', icon: ShoppingBagIcon, color: 'from-green-500 to-emerald-500' },
        { name: 'Reservations', icon: CalendarIcon, color: 'from-yellow-500 to-amber-500' },
        { name: 'Customers', icon: UsersIcon, color: 'from-orange-500 to-red-500' },
        { name: 'Analytics', icon: ChartBarIcon, color: 'from-indigo-500 to-purple-500' },
        { name: 'Settings', icon: Cog6ToothIcon, color: 'from-gray-500 to-gray-600' },
    ];

    const stats = [
        {
            label: 'Total Sales',
            value: `$${(analytics.totalSales || 0).toLocaleString()}`,
            change: '+12.5%',
            icon: CurrencyDollarIcon,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
            textColor: 'text-green-400'
        },
        {
            label: 'Active Orders',
            value: analytics.activeOrders,
            change: '+8.2%',
            icon: ClockIcon,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
            textColor: 'text-blue-400'
        },
        {
            label: 'Total Orders',
            value: analytics.totalOrders,
            change: '+23.1%',
            icon: ShoppingBagIcon,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
            textColor: 'text-purple-400'
        },
        {
            label: 'New Customers',
            value: analytics.newCustomers,
            change: '+5.7%',
            icon: UserGroupIcon,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
            textColor: 'text-orange-400'
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
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-40 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
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
                className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800/50 z-20 hidden md:flex flex-col backdrop-blur-xl`}
            >
                <div className="p-6 border-b border-gray-800/50">
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-50"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">RestoAdmin</span>
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
                                className={`relative w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${activeTab === item.name ? 'text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {activeTab === item.name && (
                                    <motion.div layoutId="activeTab" className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20`} transition={{ type: "spring", duration: 0.5 }} />
                                )}
                                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                <div className={`absolute left-0 w-1 h-8 bg-gradient-to-b ${item.color} rounded-r-full transition-all duration-200 ${activeTab === item.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                                <Icon className={`h-6 w-6 mr-3 relative z-10 transition-colors ${activeTab === item.name ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                <span className="font-medium relative z-10">{item.name}</span>
                            </motion.button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800/50">
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0) || 'A'}</div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">Admin</p>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                        </motion.button>
                        <AnimatePresence>
                            {isProfileMenuOpen && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-full left-0 w-full mb-2 bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                                    <button onClick={logout} className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition">
                                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" /> Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            <main className={`flex-1 md:ml-72 relative overflow-y-auto`}>
                <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
                    <div className="flex items-center justify-between px-8 py-4">
                        <div>
                            <motion.h1 key={activeTab} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-white">{activeTab}</motion.h1>
                            <p className="text-sm text-gray-400 mt-1">{selectedRestaurant ? selectedRestaurant.name : 'Platform Overview'}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 w-64" />
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
                                            className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6"
                                        >
                                            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-600/20">
                                                {selectedRestaurant.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                                    <h2 className="text-2xl font-bold text-white">{selectedRestaurant.name}</h2>
                                                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Active Establishment</span>
                                                </div>
                                                <p className="text-indigo-300/60 text-sm max-w-xl">{selectedRestaurant.description || "No description provided for this establishment."}</p>
                                                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                                                    <div className="flex items-center gap-1 text-xs text-indigo-400/80">
                                                        <MapIcon className="w-3 h-3" />
                                                        {selectedRestaurant.address}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-indigo-400/80">
                                                        <FireIcon className="w-3 h-3" />
                                                        {selectedRestaurant.cuisine} Cuisine
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // This resets the state and shows global platform view
                                                    setSelectedRestaurant(null);
                                                }}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95"
                                            >
                                                Platform View
                                            </button>
                                        </motion.div>
                                    )}

                                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {stats.map((stat, idx) => {
                                            const Icon = stat.icon;
                                            return (
                                                <motion.div key={idx} variants={fadeInUp} whileHover={{ y: -4 }} className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden">
                                                    <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                                                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                                                            <p className="text-xs text-green-400 mt-1">{stat.change}</p>
                                                        </div>
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg`}><Icon className="w-6 h-6 text-white" /></div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>

                                    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 backdrop-blur-xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                                    <SparklesIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">Gemini AI Stock Predictions</h2>
                                                    <p className="text-sm text-indigo-300">Intelligent inventory forecasting</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={fetchAIPredictions}
                                                disabled={isPredicting}
                                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition group"
                                            >
                                                <ArrowPathIcon className={`w-5 h-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-500 ${isPredicting ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>

                                        {isPredicting ? (
                                            <div className="space-y-4">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>
                                                ))}
                                            </div>
                                        ) : predictions.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {predictions.map((p, idx) => (
                                                    <div key={idx} className="bg-black/40 border border-white/5 p-5 rounded-2xl group hover:border-indigo-500/30 transition-colors">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <h4 className="font-bold text-white">{p.name}</h4>
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.risk === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                                                }`}>
                                                                {p.risk} Risk
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">{p.reason}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                            <ExclamationTriangleIcon className="w-3 h-3" />
                                                            {p.recommendation}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5 border-dashed">
                                                <CheckCircleIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                                <p className="text-gray-500 font-medium">Inventory looks stable. No critical items flagged.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                    {/* Multi-Establishment Performance Table (Platform View Only) */}
                                    {!selectedRestaurant && analytics.restaurantStats && analytics.restaurantStats.length > 0 && (
                                        <motion.div variants={fadeInUp} className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl">
                                            <div className="p-8 border-b border-gray-800 flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">Multi-Establishment Performance</h2>
                                                    <p className="text-sm text-gray-400">Establishment-wise breakdown of key metrics</p>
                                                </div>
                                                <button
                                                    onClick={() => setActiveTab('Restaurants')}
                                                    className="px-4 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-xl hover:bg-indigo-600 hover:text-white transition font-bold text-xs uppercase tracking-widest"
                                                >
                                                    Manage All
                                                </button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-black/20 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                                            <th className="px-8 py-4">Establishment</th>
                                                            <th className="px-8 py-4">Orders</th>
                                                            <th className="px-8 py-4">Active</th>
                                                            <th className="px-8 py-4 text-right">Revenue</th>
                                                            <th className="px-8 py-4">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-800/50">
                                                        {analytics.restaurantStats.map((stat) => (
                                                            <tr key={stat.id} className="group hover:bg-white/5 transition-colors">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                                                            {stat.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-white uppercase tracking-wider">{stat.name}</p>
                                                                            <p className="text-xs text-gray-500">{stat.cuisine} Cuisine</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="text-sm font-medium text-gray-300">{stat.totalOrders}</span>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${stat.activeOrders > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-500'}`}>
                                                                        {stat.activeOrders} Active
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right">
                                                                    <span className="text-sm font-bold text-green-400">${(stat.totalSales || 0).toLocaleString()}</span>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedRestaurant(stat);
                                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                        }}
                                                                        className="p-2 opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
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
                            {activeTab === 'Analytics' && <Analytics />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
