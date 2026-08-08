import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import { getAnalytics, getRestaurants } from '../../../services/api';
import Menu from '../Menu';
import Orders from '../Orders';
import Settings from '../Settings';
import Reservations from '../Reservations';
import NotificationTray from '../NotificationTray';
import ChatAssistant from '../../../components/ChatAssistant';
import AuthContext from '../../../context/AuthContext';
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
    CalendarIcon,
    MapPinIcon,
    ArrowRightIcon,
    ArrowPathIcon,
    SunIcon,
    MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../context/ThemeContext';

const UserDashboard = ({ user, logout }) => {
    const navigate = useNavigate();
    const { selectedRestaurant, setSelectedRestaurant, restaurants, refreshRestaurants } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const [loadingRestaurants, setLoadingRestaurants] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalOrders: 0,
        activeOrders: 0,
        totalSales: 0 // For User, this is total spent
    });

    useEffect(() => {
        if (selectedRestaurant) {
            fetchAnalytics();
        } else if (restaurants.length === 0) {
            setLoadingRestaurants(true);
            refreshRestaurants().finally(() => setLoadingRestaurants(false));
        }
    }, [selectedRestaurant?._id]);

    const fetchAnalytics = async () => {
        try {
            const { data } = await getAnalytics(selectedRestaurant?._id);
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
            value: `₹${analytics.totalSales}`,
            icon: CurrencyDollarIcon,
            color: 'from-green-500 to-emerald-500'
        },
        {
            label: 'Active Orders',
            value: analytics.activeOrders,
            icon: ClockIcon,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Total Orders',
            value: analytics.totalOrders,
            icon: ShoppingBagIcon,
            color: 'from-purple-500 to-pink-500'
        },
        {
            label: 'Reward Points',
            value: analytics.loyaltyPoints || 0,
            icon: SparklesIcon,
            color: 'from-orange-500 to-orange-500'
        }
    ];

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div className="fixed inset-0 overflow-hidden -z-10 bg-[#0a0a0a]">
                <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-orange-500 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-40 right-20 w-[600px] h-[600px] bg-orange-600 rounded-full mix-blend-multiply filter blur-[150px] opacity-10 animate-pulse animation-delay-4000"></div>
            </div>

            <motion.aside initial={{ x: -100 }} animate={{ x: 0 }} className="fixed inset-y-0 left-0 w-72 z-20 hidden md:flex flex-col border-r border-black/5" style={{ background: 'var(--sidebar-bg)' }}>
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_5px_15px_rgba(249,115,22,0.3)]">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-orange-500 uppercase tracking-tighter">DINE FLOW</span>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`relative w-full flex items-center px-5 py-4 rounded-2xl transition-all group ${activeTab === item.name ? 'text-white' : 'opacity-40 hover:opacity-100'}`}
                        >
                            {activeTab === item.name && (
                                <motion.div layoutId="userActiveTab" className="absolute inset-0 bg-orange-500 rounded-2xl shadow-[0_5px_15px_rgba(249,115,22,0.2)]" />
                            )}
                            <item.icon className="h-5 w-5 mr-4 relative z-10" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-4 px-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-xs border border-orange-500/20 uppercase overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest truncate">{user?.name}</p>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mt-0.5 text-orange-500">Premium Member</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest text-orange-500 hover:bg-orange-500/5 rounded-2xl transition-colors">
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-4" /> Sign Out
                    </button>
                </div>
            </motion.aside>

            <main className="flex-1 md:ml-72 relative overflow-y-auto pb-24 md:pb-0">
                <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/5 px-8 py-6 flex justify-between items-center" style={{ background: 'var(--navbar-bg)' }}>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">{activeTab}</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Account Name: {user?.name} {selectedRestaurant ? ` Connected to ${selectedRestaurant.name}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center theme-card-item rounded-xl border border-white/10 hover:border-orange-500/50 transition-all shadow-sm" title="Toggle theme">
                            {theme === 'dark' ? <SunIcon className="w-4 h-4 text-orange-400" /> : <MoonIcon className="w-4 h-4 text-orange-600" />}
                        </button>
                        <button onClick={logout} className="md:hidden w-10 h-10 flex items-center justify-center theme-card-item rounded-xl border border-black/5 hover:border-red-500/30 text-orange-500 transition-all shadow-sm" title="Sign Out">
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        </button>
                        {selectedRestaurant && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedRestaurant(null)}
                                className="hidden md:flex items-center px-6 py-3 theme-card-item border border-black/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-orange-500/30 transition shadow-sm"
                            >
                                <ArrowPathIcon className="w-4 h-4 mr-2.5 opacity-40" />
                                Disconnect
                            </motion.button>
                        )}
                        <NotificationTray />
                    </div>
                </header>

                <div className="p-8">
                    {activeTab === 'Overview' && (
                        <>
                            {!selectedRestaurant ? (
                                <div className="space-y-10">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h2 className="text-4xl font-black uppercase tracking-tighter">Find Restaurants</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Restaurants near you</p>
                                        </div>
                                        <div className="hidden lg:block w-32 h-px bg-orange-600/20 mb-3"></div>
                                    </div>

                                    {loadingRestaurants ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-80 theme-card-item rounded-[2.5rem] border border-black/5 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {restaurants.map((res) => (
                                                <motion.div
                                                    key={res._id}
                                                    whileHover={{ y: -10 }}
                                                    className="group relative theme-card rounded-[2.5rem] border border-black/5 hover:border-orange-500/30 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-600/10"
                                                    onClick={() => {
                                                        setSelectedRestaurant(res);
                                                        setActiveTab('Menu');
                                                    }}
                                                >
                                                    <div className="h-48 overflow-hidden relative">
                                                        {res.image ? (
                                                            <img
                                                                src={res.image}
                                                                alt={res.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                                                                onError={e => e.target.style.display = 'none'}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-orange-600/[0.05] flex items-center justify-center">
                                                                <span className="text-6xl font-black text-orange-600/10 uppercase tracking-tighter">{res.name.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                                        <div className="absolute top-6 right-6">
                                                            <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-xl shadow-orange-600/40">
                                                                <ArrowRightIcon className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-8">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500 mb-2 block">{res.cuisine}</span>
                                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{res.name}</h3>
                                                        <p className="text-xs font-medium opacity-40 mb-6 line-clamp-2 leading-relaxed uppercase tracking-widest">{res.description || "Premium dining experience awaits you."}</p>
                                                        <div className="flex items-center justify-between pt-6 border-t border-black/5">
                                                            <div className="flex items-center gap-2">
                                                                <MapPinIcon className="w-4 h-4 opacity-20" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Location Verified</span>
                                                            </div>
                                                            <div className="px-4 py-1.5 bg-black/5 rounded-full text-[8px] font-black uppercase tracking-widest opacity-60">Open Now</div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                                    {stats.map((stat, idx) => (
                                        <div key={idx} className="theme-card-item rounded-3xl p-8 border border-black/5 relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-sm">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">{stat.label}</p>
                                                <p className="text-3xl font-black uppercase tracking-tight">{stat.value}</p>
                                                <div className={`mt-6 inline-flex p-3 bg-orange-600/10 rounded-xl`}>
                                                    <stat.icon className="w-5 h-5 text-orange-500" />
                                                </div>
                                            </div>
                                            <stat.icon className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            {activeTab === 'Menu' && <Menu />}
                            {(activeTab === 'My Orders' || activeTab === 'Orders') && <Orders />}
                            {activeTab === 'Settings' && <Settings />}
                            {activeTab === 'Reservations' && <Reservations />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-xl bg-black/90 border-t border-white/10 pb-6 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-around px-2">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl transition-all ${
                                activeTab === item.name ? 'text-orange-500 scale-110' : 'text-white/40 hover:text-white/80'
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[8px] font-black uppercase tracking-widest truncate max-w-[60px] text-center">{item.name === 'Overview' ? 'Home' : item.name === 'My Orders' ? 'Orders' : item.name === 'Reservations' ? 'Book' : item.name}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <ChatAssistant />
        </div>
    );
};

export default UserDashboard;
