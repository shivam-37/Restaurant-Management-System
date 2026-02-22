import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getAnalytics } from '../../../services/api';
import AuthContext from '../../../context/AuthContext';
import {
    ChartBarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    UsersIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
    const { selectedRestaurant } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [selectedRestaurant?._id]);

    const fetchAnalytics = async () => {
        try {
            const res = await getAnalytics(selectedRestaurant?._id);
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse h-64 bg-gray-900 rounded-2xl"></div>;
    if (!data) return <div className="text-gray-400 p-8 text-center">No analytics data available</div>;

    const maxSales = Math.max(...(data.dailySales?.map(d => d.sales) || [1]), 1);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Business Analytics</h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm border border-green-500/20">
                    <ArrowUpIcon className="w-4 h-4" />
                    <span>+12.5% this week</span>
                </div>
            </div>

            {/* Daily Sales Chart */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Weekly Revenue</p>
                        <h3 className="text-3xl font-bold text-white">${data.totalSales.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="flex items-end justify-between h-48 gap-2">
                    {data.dailySales?.map((day, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="relative w-full flex flex-col justify-end h-32">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(day.sales / maxSales) * 100}%` }}
                                    className="bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg group-hover:from-indigo-500 group-hover:to-purple-400 transition-all relative"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        ${day.sales}
                                    </div>
                                </motion.div>
                            </div>
                            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{day.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">New Customers</p>
                        <h4 className="text-2xl font-bold text-white">{data.newCustomers}</h4>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-orange-400" />
                    </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Avg. Order Value</p>
                        <h4 className="text-2xl font-bold text-white">
                            ${(data.totalSales / (data.totalOrders || 1)).toFixed(2)}
                        </h4>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
