import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import { getAnalytics, predictInventory, pushNotification } from '../../../services/api';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
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

    // Push Notification State
    const [pushMessage, setPushMessage] = useState('');
    const [pushType, setPushType] = useState('Offer');
    const [isPushing, setIsPushing] = useState(false);
    const [pushStatus, setPushStatus] = useState(null);

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

    const handlePushNotification = async () => {
        if (!pushMessage.trim()) return;
        setIsPushing(true);
        setPushStatus(null);
        try {
            const res = await pushNotification({
                message: pushMessage,
                type: pushType,
                restaurantId: selectedRestaurant._id
            });
            setPushStatus({ type: 'success', message: res.data.message });
            setPushMessage('');
        } catch (error) {
            setPushStatus({ type: 'error', message: 'Failed to push notification.' });
        } finally {
            setIsPushing(false);
            setTimeout(() => setPushStatus(null), 5000);
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
                            <div className="w-28 h-28 border-4 border-rose-500/10 border-t-[#f97316] rounded-full animate-spin mx-auto shadow-2xl"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-rose-600 rounded-3xl animate-pulse rotate-45 shadow-xl shadow-rose-600/40 flex items-center justify-center">
                                    <SparklesIcon className="w-6 h-6 text-white -rotate-45" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Loading Dashboard</h2>
                        <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.2em]">Setting up your restaurant...</p>
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
        { name: 'Reservations', icon: CalendarIcon, color: 'from-yellow-500 to-rose-500' },
        { name: 'Performance', icon: ChartPieIcon, color: 'from-cyan-500 to-blue-500' },
        { name: 'Table Map', icon: MapIcon, color: 'from-blue-500 to-rose-500' },
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
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]" style={{ color: 'var(--text-primary)' }}>
            {/* Top Navigation Bar */}
            <header className="flex-shrink-0 z-50 backdrop-blur-3xl border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/80 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4 lg:gap-8 flex-1 min-w-0">
                     <div className="flex items-center space-x-3 shrink-0">
                         <div className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                             <ChefHat className="w-5 h-5 text-white" />
                         </div>
                         <div className="flex flex-col hidden sm:flex">
                             <span className="text-lg font-black uppercase tracking-tighter leading-none">Dine Flow</span>
                             <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#f97316] mt-1">Owner Portal</span>
                         </div>
                     </div>
                     
                     <nav className="hidden lg:flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 group whitespace-nowrap shrink-0 ${activeTab === item.name 
                                    ? 'bg-[#f97316] text-white shadow-md shadow-orange-500/20' 
                                    : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            >
                                <item.icon className={`h-4 w-4 mr-1.5 transition-transform group-hover:scale-110 ${activeTab === item.name ? 'text-white' : 'text-[#f97316]'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                            </button>
                        ))}
                     </nav>
                 </div>

                 <div className="flex items-center gap-4 shrink-0 ml-4">
                     <NotificationTray />
                     <div className="h-6 w-px bg-black/10 dark:bg-white/10" />
                     <button 
                         onClick={toggleTheme} 
                         className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-500/10 text-[#f97316] dark:text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all shadow-sm"
                     >
                         {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                     </button>
                     
                     {/* Profile Dropdown */}
                     <div className="relative">
                         <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden hover:scale-105 transition-transform">
                                 {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
                             </div>
                         </button>
                         <AnimatePresence>
                             {isProfileMenuOpen && (
                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-56 bg-white dark:bg-gray-900 rounded-2xl border border-black/5 dark:border-white/5 shadow-2xl py-2">
                                     <div className="px-5 py-3 border-b border-black/5 dark:border-white/5 mb-2">
                                         <p className="text-xs font-black uppercase tracking-widest truncate">{user?.name}</p>
                                         <p className="text-[9px] text-[#f97316] font-bold uppercase tracking-widest mt-1">Owner Account</p>
                                     </div>
                                     <button onClick={logout} className="w-full flex items-center px-5 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors">
                                         <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-3" /> Log Out
                                     </button>
                                 </motion.div>
                             )}
                         </AnimatePresence>
                     </div>
                 </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a] relative pb-24 lg:pb-0">
                <div className="max-w-7xl mx-auto p-6 lg:p-10">
                    <div className="mb-10 flex items-end justify-between">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{activeTab}</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-40">{selectedRestaurant?.name}</p>
                        </div>
                    </div>

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
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-4 shadow-xl shadow-rose-600/20 group-hover:scale-110 transition-transform duration-500`}>
                                                <stat.icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* AI Predictions */}
                            <div className="theme-card bg-gradient-to-br from-rose-500/5 via-transparent to-purple-500/5 rounded-[3rem] p-10 mb-10 border border-rose-500/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] -mr-32 -mt-32"></div>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-400 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-600/20">
                                            <SparklesIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">Stock Prediction</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Stock Prediction AI</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={fetchAIPredictions} 
                                        className="flex items-center gap-3 px-6 py-4 bg-white/10 dark:bg-white/5 hover:bg-rose-600 hover:text-white rounded-2xl border border-black/5 transition-all group font-black text-[10px] uppercase tracking-widest shadow-lg"
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${isPredicting ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                                        Update
                                    </button>
                                </div>
                                {predictions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                        {predictions.map((p, idx) => (
                                            <div key={idx} className="theme-card-item p-6 rounded-[1.5rem] border border-rose-500/20 shadow-sm hover:shadow-xl transition-all group/item">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-black text-lg tracking-tight leading-none">{p.name}</h4>
                                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/50"></div>
                                                </div>
                                                <p className="text-xs font-bold opacity-50 mb-6 leading-relaxed uppercase tracking-tight">{p.reason}</p>
                                                <div className="flex items-center gap-3 text-[10px] text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest bg-rose-500/10 p-4 rounded-xl border border-rose-500/10">
                                                    <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                                    {p.recommendation}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 theme-card-item rounded-3xl border border-black/5 border-dashed relative z-10">
                                        <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-10 text-green-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Stock levels are fine</p>
                                    </div>
                                )}
                            </div>

                            {/* Marketing & Alerts (Push Notifications) */}
                            <div className="theme-card rounded-[3rem] p-10 mb-10 border border-black/5 shadow-sm relative overflow-hidden">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 relative z-10">
                                     <div className="flex items-center gap-6">
                                         <div className="w-16 h-16 bg-gradient-to-br from-[#f97316] to-orange-400 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                                             <MegaphoneIcon className="w-8 h-8 text-white" />
                                         </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">Marketing & Alerts</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Push notifications to your customers</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <div className="flex gap-4 mb-2">
                                        {['Offer', 'Alert'].map(type => (
                                             <button
                                                 key={type}
                                                 onClick={() => setPushType(type)}
                                                 className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${pushType === type ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/30' : 'theme-card-item border border-black/5 opacity-50 hover:opacity-100'}`}
                                             >
                                                 {type}
                                             </button>
                                        ))}
                                    </div>
                                     <textarea
                                         value={pushMessage}
                                         onChange={(e) => setPushMessage(e.target.value)}
                                         placeholder={`Enter your ${pushType.toLowerCase()} message here...`}
                                         className="w-full h-32 theme-card-item border border-black/5 rounded-2xl p-6 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#f97316] transition-all font-bold placeholder:opacity-30 resize-none"
                                     />
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <AnimatePresence>
                                                {pushStatus && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className={`text-xs font-black uppercase tracking-widest ${pushStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}
                                                    >
                                                        {pushStatus.message}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                         <button
                                             onClick={handlePushNotification}
                                             disabled={isPushing || !pushMessage.trim()}
                                             className="px-8 py-4 bg-[#f97316] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                         >
                                             {isPushing ? (
                                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <MegaphoneIcon className="w-4 h-4" />
                                            )}
                                            Send to Customers
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            {activeTab === 'Menu' && <Menu />}
                            {(activeTab === 'Orders' || activeTab === 'My Orders') && <Orders />}
                            {activeTab === 'Kitchen' && <KitchenDisplay />}
                            {activeTab === 'Table Map' && <TableMap />}
                            {activeTab === 'Reservations' && <Reservations />}
                            {activeTab === 'Performance' && <Analytics />}
                            {activeTab === 'Settings' && <Settings />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Bottom Navigation for Owner Dashboard */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-xl bg-black/90 border-t border-white/10 pb-6 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-around px-2 overflow-x-auto scrollbar-hide">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl transition-all min-w-[60px] ${
                                activeTab === item.name ? 'text-[#f97316] scale-110' : 'text-white/40 hover:text-white/80'
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[8px] font-black uppercase tracking-widest truncate max-w-[60px] text-center">{item.name === 'Overview' ? 'Home' : item.name}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default OwnerDashboard;
