import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalytics, predictInventory } from '../../../services/api';
import Menu from '../Menu';
import Orders from '../Orders';
import Settings from '../Settings';
import KitchenDisplay from '../admin/KitchenDisplay'; // Reusing components
import TableMap from '../admin/TableMap';
import CreateRestaurant from '../../../components/owner/CreateRestaurant';
import Reservations from '../Reservations';
import Analytics from '../admin/Analytics';
import NotificationTray from '../NotificationTray';
import AuthContext from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
    SunIcon,
    MoonIcon,
    HomeIcon,
    ClipboardDocumentListIcon,
    FireIcon,
    MapIcon,
    ShoppingBagIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    ChevronDownIcon,
    SparklesIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon,
    ClockIcon,
    UserGroupIcon,
    ChartBarIcon,
    CalendarIcon,
    ChartPieIcon
} from '@heroicons/react/24/outline';

const OwnerDashboard = () => {
    const { user, logout, selectedRestaurant } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    console.log("OwnerDashboard Render - User:", user?.name, "Role:", user?.role, "Selected Restaurant:", selectedRestaurant?.name || 'NONE');

    const [activeTab, setActiveTab] = useState('Overview');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        // If no restaurant, wait 3 seconds for fallback fetch before showing onboarding
        if (!selectedRestaurant) {
            const timer = setTimeout(() => {
                setShowOnboarding(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setShowOnboarding(false);
        }
    }, [selectedRestaurant]);

    const [analytics, setAnalytics] = useState({
        totalOrders: 0,
        activeOrders: 0,
        totalSales: 0,
        newCustomers: 0
    });
    const [predictions, setPredictions] = useState([]);
    const [isPredicting, setIsPredicting] = useState(false);

    useEffect(() => {
        if (selectedRestaurant?._id) {
            fetchAnalytics();
            fetchAIPredictions();
        }
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

    // If owner has no restaurant, show onboarding after a brief sync attempt
    if (!selectedRestaurant) {
        if (!showOnboarding) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ background: 'var(--bg-primary)' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md w-full"
                    >
                        <div className="relative mb-10">
                            <div className="w-28 h-28 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mx-auto shadow-2xl"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-amber-600 rounded-3xl animate-pulse rotate-45 shadow-xl shadow-amber-600/40 flex items-center justify-center">
                                    <SparklesIcon className="w-6 h-6 text-white -rotate-45" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Syncing Spectrum</h2>
                        <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.2em]">Initializing AI Establishment Node...</p>
                    </motion.div>
                </div>
            );
        }
        return <CreateRestaurant />;
    }

    const navItems = [
        { name: 'Overview', icon: HomeIcon, color: 'from-blue-500 to-cyan-500' },
        { name: 'Menu', icon: ClipboardDocumentListIcon, color: 'from-purple-500 to-pink-500' },
        { name: 'Orders', icon: ShoppingBagIcon, color: 'from-orange-600 to-red-600' },
        { name: 'Kitchen', icon: UserGroupIcon, color: 'from-green-500 to-teal-500' },
        { name: 'Reservations', icon: CalendarIcon, color: 'from-yellow-500 to-amber-500' },
        { name: 'Performance', icon: ChartPieIcon, color: 'from-cyan-500 to-blue-500' },
        { name: 'Table Map', icon: MapIcon, color: 'from-blue-500 to-amber-500' },
        { name: 'Analytics', icon: ChartBarIcon, color: 'from-amber-500 to-purple-500' },
        { name: 'Settings', icon: Cog6ToothIcon, color: 'from-gray-500 to-gray-600' },
    ];

    const stats = [
        {
            label: 'Total Sales',
            value: `₹${(analytics.totalSales || 0).toLocaleString()}`,
            icon: CurrencyDollarIcon,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-400'
        },
        {
            label: 'Active Orders',
            value: analytics.activeOrders,
            icon: ClockIcon,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/20',
            textColor: 'text-blue-400'
        },
        {
            label: 'Total Orders',
            value: analytics.totalOrders,
            icon: ShoppingBagIcon,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/20',
            textColor: 'text-purple-400'
        }
    ];

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                className="w-72 border-r hidden md:flex flex-col"
                style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}
            >
                <div className="p-6 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20 group cursor-pointer hover:rotate-12 transition-transform duration-300">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black uppercase tracking-tighter leading-none">Dine Flow</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500 mt-1">Owner Intel</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center px-5 py-4 rounded-[1.25rem] transition-all duration-300 group ${activeTab === item.name 
                                ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20' 
                                : 'opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 hover:translate-x-1'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 mr-4 transition-transform group-hover:scale-110 ${activeTab === item.name ? 'text-white' : 'text-amber-500'}`} />
                            <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-black/5 dark:border-white/5 bg-amber-500/5">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group relative"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-600/20 group-hover:scale-110 transition-transform">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight truncate">{user?.name}</p>
                            <div className="flex items-center gap-1.5 opacity-40">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Verified Owner</p>
                            </div>
                        </div>
                    </button>
                    <AnimatePresence>
                        {isProfileMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl"
                            >
                                <button onClick={logout} className="w-full flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-colors">
                                    <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-3" /> Terminate Session
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto">
                <header className="sticky top-0 z-10 backdrop-blur-3xl border-b px-10 py-6 flex items-center justify-between" style={{ background: 'var(--navbar-bg)', borderColor: 'var(--border-color)' }}>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{activeTab}</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-40">{selectedRestaurant?.name}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <NotificationTray />
                        <div className="h-8 w-px bg-black/5 dark:bg-white/10 mx-2" />
                        <button 
                            onClick={toggleTheme} 
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-600/10 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-all shadow-lg shadow-amber-600/5 group"
                        >
                            {theme === 'dark' ? <SunIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> : <MoonIcon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />}
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {activeTab === 'Overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="theme-card rounded-[2rem] p-8 border border-black/5 shadow-sm hover:shadow-2xl transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{stat.label}</p>
                                                <p className={`text-4xl font-black tracking-tighter ${stat.textColor}`}>{stat.value}</p>
                                            </div>
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-4 shadow-xl shadow-amber-600/20 group-hover:scale-110 transition-transform duration-500`}>
                                                <stat.icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* AI Predictions */}
                            <div className="theme-card bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 rounded-[3rem] p-10 mb-10 border border-amber-500/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mt-32"></div>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-400 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-600/20">
                                            <SparklesIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">Inventory Forecast</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Intelligence Protocol: NVIDIA Neural Engine</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={fetchAIPredictions} 
                                        className="flex items-center gap-3 px-6 py-4 bg-white/10 dark:bg-white/5 hover:bg-amber-600 hover:text-white rounded-2xl border border-black/5 transition-all group font-black text-[10px] uppercase tracking-widest shadow-lg"
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${isPredicting ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                                        Refresh Model
                                    </button>
                                </div>
                                {predictions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                        {predictions.map((p, idx) => (
                                            <div key={idx} className="theme-card-item p-6 rounded-[1.5rem] border border-amber-500/20 shadow-sm hover:shadow-xl transition-all group/item">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-black text-lg tracking-tight leading-none">{p.name}</h4>
                                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50"></div>
                                                </div>
                                                <p className="text-xs font-bold opacity-50 mb-6 leading-relaxed uppercase tracking-tight">{p.reason}</p>
                                                <div className="flex items-center gap-3 text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest bg-amber-500/10 p-4 rounded-xl border border-amber-500/10">
                                                    <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                                    {p.recommendation}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 theme-card-item rounded-3xl border border-black/5 border-dashed relative z-10">
                                        <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-10 text-green-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">All inventory vectors stabilized</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {activeTab === 'Menu' && <Menu />}
                            {activeTab === 'Orders' && <Orders />}
                            {activeTab === 'Reservations' && <Reservations />}
                            {activeTab === 'Kitchen' && <KitchenDisplay />}
                            {activeTab === 'Table Map' && <TableMap />}
                            {activeTab === 'Analytics' && <Analytics />}
                            {activeTab === 'Settings' && <Settings />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default OwnerDashboard;
