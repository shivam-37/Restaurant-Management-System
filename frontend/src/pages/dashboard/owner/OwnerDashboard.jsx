import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalytics, predictInventory } from '../../../services/api';
import Menu from '../Menu';
import Orders from '../Orders';
import Settings from '../Settings';
import KitchenDisplay from '../admin/KitchenDisplay'; // Reusing components
import TableMap from '../admin/TableMap';
import CreateRestaurant from '../../../components/owner/CreateRestaurant';
import AuthContext from '../../../context/AuthContext';
import {
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
    UserGroupIcon
} from '@heroicons/react/24/outline';

const OwnerDashboard = () => {
    const { user, logout, selectedRestaurant } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Overview');
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

    // If owner has no restaurant, show onboarding
    if (!selectedRestaurant) {
        return <CreateRestaurant />;
    }

    const navItems = [
        { name: 'Overview', icon: HomeIcon, color: 'from-blue-500 to-cyan-500' },
        { name: 'Menu', icon: ClipboardDocumentListIcon, color: 'from-purple-500 to-pink-500' },
        { name: 'Orders', icon: ShoppingBagIcon, color: 'from-green-500 to-emerald-500' },
        { name: 'Kitchen', icon: FireIcon, color: 'from-orange-500 to-red-500' },
        { name: 'Table Map', icon: MapIcon, color: 'from-blue-500 to-indigo-500' },
        { name: 'Settings', icon: Cog6ToothIcon, color: 'from-gray-500 to-gray-600' },
    ];

    const stats = [
        {
            label: 'Total Sales',
            value: `$${analytics.totalSales}`,
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
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                className="w-72 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800/50 hidden md:flex flex-col"
            >
                <div className="p-6 border-b border-gray-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">RestoOwner</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.name ? 'bg-gray-800/50 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`h-6 w-6 mr-3 ${activeTab === item.name ? 'text-indigo-400' : 'text-gray-500'}`} />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800/50">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition relative"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0)}</div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-indigo-400">Owner</p>
                        </div>
                    </button>
                    {isProfileMenuOpen && (
                        <div className="mt-2 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <button onClick={logout} className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition">
                                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto">
                <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800/50 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{activeTab}</h1>
                        <p className="text-sm text-gray-400">{selectedRestaurant?.name}</p>
                    </div>
                </header>

                <div className="p-8">
                    {activeTab === 'Overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold">{stat.value}</p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3`}><stat.icon className="w-6 h-6 text-white" /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* AI Predictions */}
                            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 mb-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                                            <SparklesIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">Smart Inventory Forecast</h2>
                                            <p className="text-sm text-indigo-300">Powered by Gemini AI</p>
                                        </div>
                                    </div>
                                    <button onClick={fetchAIPredictions} className="p-2 bg-white/5 rounded-xl"><ArrowPathIcon className={`w-5 h-5 ${isPredicting ? 'animate-spin' : ''}`} /></button>
                                </div>
                                {predictions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {predictions.map((p, idx) => (
                                            <div key={idx} className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                                                <h4 className="font-bold mb-2">{p.name}</h4>
                                                <p className="text-xs text-gray-400 mb-4">{p.reason}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-indigo-400 uppercase font-bold tracking-widest">
                                                    <ExclamationTriangleIcon className="w-3 h-3" />
                                                    {p.recommendation}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 opacity-50"><CheckCircleIcon className="w-10 h-10 mx-auto mb-2" /><p>Everything looks good!</p></div>
                                )}
                            </div>
                        </>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {activeTab === 'Menu' && <Menu />}
                            {activeTab === 'Orders' && <Orders />}
                            {activeTab === 'Kitchen' && <KitchenDisplay />}
                            {activeTab === 'Table Map' && <TableMap />}
                            {activeTab === 'Settings' && <Settings />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default OwnerDashboard;
