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
        <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-gray-800 rounded-xl w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-900 rounded-2xl" />)}
            </div>
            <div className="h-64 bg-gray-900 rounded-2xl" />
        </div>
    );

    if (error) return (
        <div className="text-center py-20">
            <ChartBarIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-semibold mb-2">Failed to Load Analytics</p>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button onClick={fetchAnalytics} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">Retry</button>
        </div>
    );

    if (!data) return (
        <div className="text-center py-20">
            <ChartBarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No analytics data available yet.</p>
            <p className="text-gray-600 text-sm mt-1">Start accepting orders to see your stats here.</p>
        </div>
    );

    const maxSales = Math.max(...(data.dailySales?.map(d => d.sales) || [0]), 1);
    const avgOrderValue = data.totalOrders > 0 ? (data.totalSales / data.totalOrders) : 0;

    const statCards = [
        {
            label: 'Total Revenue',
            value: `₹${(data.totalSales || 0).toLocaleString('en-IN')}`,
            icon: BanknotesIcon,
            color: 'from-green-500 to-emerald-500',
            bg: 'bg-green-500/10',
            textColor: 'text-green-400'
        },
        {
            label: 'Total Orders',
            value: data.totalOrders ?? 0,
            icon: ShoppingBagIcon,
            color: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-500/10',
            textColor: 'text-blue-400'
        },
        {
            label: 'Active Orders',
            value: data.activeOrders ?? 0,
            icon: ClockIcon,
            color: 'from-orange-500 to-amber-500',
            bg: 'bg-orange-500/10',
            textColor: 'text-orange-400'
        },
        {
            label: 'New Customers Today',
            value: data.newCustomers ?? 0,
            icon: UserGroupIcon,
            color: 'from-purple-500 to-pink-500',
            bg: 'bg-purple-500/10',
            textColor: 'text-purple-400'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Business Analytics</h1>
                    <p className="text-sm text-gray-400 mt-1">{selectedRestaurant?.name || 'All Restaurants'}</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm hover:bg-indigo-600/20 transition"
                >
                    <ArrowUpIcon className="w-4 h-4 rotate-[135deg]" />
                    Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5"
                    >
                        <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                        </div>
                        <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Daily Sales Bar Chart */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Weekly Revenue</p>
                        <h3 className="text-3xl font-bold text-white">₹{(data.totalSales || 0).toLocaleString('en-IN')}</h3>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Avg. Order</p>
                        <p className="text-lg font-bold text-indigo-400">₹{avgOrderValue.toFixed(2)}</p>
                    </div>
                </div>

                {(!data.dailySales || data.dailySales.length === 0 || data.dailySales.every(d => d.sales === 0)) ? (
                    <div className="h-48 flex flex-col items-center justify-center text-gray-600">
                        <ChartBarIcon className="w-10 h-10 mb-2 opacity-30" />
                        <p className="text-sm">No sales data for the last 7 days yet.</p>
                    </div>
                ) : (
                    <div className="flex items-end justify-between h-48 gap-2">
                        {data.dailySales.map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="relative w-full flex flex-col justify-end h-32">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.sales / maxSales) * 100}%` }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg group-hover:from-indigo-500 group-hover:to-purple-400 transition-all relative min-h-[4px]"
                                    >
                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ₹{(day.sales || 0).toLocaleString('en-IN')}
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{day.date}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Restaurant Stats Table (Admin only - when no restaurant filter) */}
            {data.restaurantStats && data.restaurantStats.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                        <h3 className="font-bold text-white">Per-Restaurant Breakdown</h3>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-3 text-left">Restaurant</th>
                                <th className="px-6 py-3 text-right">Orders</th>
                                <th className="px-6 py-3 text-right">Active</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {data.restaurantStats.map((stat, i) => (
                                <tr key={i} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-white">{stat.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400 text-right">{stat.totalOrders}</td>
                                    <td className="px-6 py-4 text-sm text-orange-400 text-right">{stat.activeOrders}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-400 text-right">₹{(stat.totalSales || 0).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Analytics;
