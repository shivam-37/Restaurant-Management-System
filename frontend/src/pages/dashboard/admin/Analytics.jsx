import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getAnalytics } from '../../../services/api';
import AuthContext from '../../../context/AuthContext';
import {
    ArrowUpIcon,
    UserGroupIcon,
    ShoppingBagIcon,
    BanknotesIcon,
    ClockIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
    const { selectedRestaurant } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [selectedRestaurant?._id]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAnalytics(selectedRestaurant?._id);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
            setError(err?.response?.data?.message || 'Failed to load analytics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-10 bg-orange-500/10 rounded-2xl w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-32 theme-card-item rounded-3xl" />)}
            </div>
            <div className="h-64 theme-card rounded-3xl" />
        </div>
    );

    if (error) return (
        <div className="text-center py-20 theme-card rounded-3xl border border-red-500/20">
            <ChartBarIcon className="w-16 h-16 text-orange-500 mx-auto mb-4 opacity-50" />
            <p className="text-[#f97316] dark:text-red-400 font-black uppercase tracking-widest text-xs mb-2">Sync Error</p>
            <p className="opacity-60 text-sm mb-6 max-w-xs mx-auto font-medium">{error}</p>
            <button onClick={fetchAnalytics} className="px-8 py-3 bg-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#f97316] transition shadow-lg shadow-red-500/20">Attempt Re-sync</button>
        </div>
    );

    if (!data) return (
        <div className="text-center py-20 theme-card rounded-3xl border border-black/5 border-dashed">
            <ChartBarIcon className="w-16 h-16 opacity-10 mx-auto mb-4" />
            <p className="opacity-40 font-black uppercase tracking-widest text-xs">Waiting for data...</p>
        </div>
    );

    const maxSales = Math.max(...(data.dailySales?.map(d => d.sales) || [0]), 1);
    const avgOrderValue = data.totalOrders > 0 ? (data.totalSales / data.totalOrders) : 0;

    const statCards = [
        {
            label: 'Lifetime Revenue',
            value: `₹${(data.totalSales || 0).toLocaleString('en-IN')}`,
            icon: BanknotesIcon,
            color: 'from-green-500 to-emerald-500',
            bg: 'bg-green-500/10',
            textColor: 'text-green-600 dark:text-green-400'
        },
        {
            label: 'Total Orders',
            value: data.totalOrders ?? 0,
            icon: ShoppingBagIcon,
            color: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-500/10',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Active Orders',
            value: data.activeOrders ?? 0,
            icon: ClockIcon,
            color: 'from-orange-500 to-orange-500',
            bg: 'bg-orange-500/10',
            textColor: 'text-orange-600 dark:text-orange-400'
        },
        {
            label: 'New Customers',
            value: data.newCustomers ?? 0,
            icon: UserGroupIcon,
            color: 'from-purple-500 to-pink-500',
            bg: 'bg-purple-500/10',
            textColor: 'text-purple-600 dark:text-purple-400'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Business Overview</h1>
                    <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{selectedRestaurant?.name || 'Platform-Wide Stats'}</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-3 px-6 py-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-lg shadow-orange-500/5 group"
                >
                    <ArrowUpIcon className="w-4 h-4 rotate-[135deg] group-hover:scale-110 transition-transform" />
                    Refresh Data
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="theme-card border border-black/5 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black tracking-tight ${stat.textColor}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Daily Sales Bar Chart */}
            <div className="theme-card border border-black/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 relative z-10">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Weekly Sales</p>
                        <h3 className="text-4xl font-black tracking-tighter">₹{(data.totalSales || 0).toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Average Order Value</p>
                        <p className="text-xl font-black text-orange-600 dark:text-orange-400 tracking-tight">₹{avgOrderValue.toFixed(2)}</p>
                    </div>
                </div>

                {(!data.dailySales || data.dailySales.length === 0 || data.dailySales.every(d => d.sales === 0)) ? (
                    <div className="h-64 flex flex-col items-center justify-center theme-card-item rounded-3xl border border-black/5 border-dashed relative z-10">
                        <ChartBarIcon className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No activity found</p>
                    </div>
                ) : (
                    <div className="flex items-end justify-between h-64 gap-3 relative z-10">
                        {data.dailySales.map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="relative w-full flex flex-col justify-end h-48">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.sales / maxSales) * 100}%` }}
                                        transition={{ delay: idx * 0.05, type: 'spring', stiffness: 50 }}
                                        className="bg-gradient-to-t from-orange-600 to-orange-400 rounded-2xl group-hover:from-orange-500 group-hover:to-purple-500 transition-all relative min-h-[6px] shadow-lg shadow-orange-500/10"
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 theme-card border border-black/5 text-[10px] font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none">
                                            ₹{(day.sales || 0).toLocaleString('en-IN')}
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">{day.date}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Restaurant Stats Table (Admin only - when no restaurant filter) */}
            {data.restaurantStats && data.restaurantStats.length > 0 && (
                <div className="theme-card border border-black/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-black/5 bg-orange-500/5">
                        <h3 className="text-xl font-black uppercase tracking-tighter">Restaurant Stats</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 bg-black/5 dark:bg-white/5">
                                    <th className="px-8 py-5 text-left">Restaurant Name</th>
                                    <th className="px-8 py-5 text-right">Orders</th>
                                    <th className="px-8 py-5 text-right">Active</th>
                                    <th className="px-8 py-5 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {data.restaurantStats.map((stat, i) => (
                                    <tr key={i} className="hover:bg-black/5 transition-all group">
                                        <td className="px-8 py-6 text-sm font-black uppercase tracking-wider">{stat.name}</td>
                                        <td className="px-8 py-6 text-sm font-bold opacity-60 text-right tracking-tighter">{stat.totalOrders} Orders</td>
                                        <td className="px-8 py-6 text-sm text-orange-600 dark:text-orange-400 text-right font-black uppercase tracking-widest text-[10px]">{stat.activeOrders} Active</td>
                                        <td className="px-8 py-6 text-sm font-black text-green-600 dark:text-green-400 text-right tracking-tighter">₹{(stat.totalSales || 0).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
