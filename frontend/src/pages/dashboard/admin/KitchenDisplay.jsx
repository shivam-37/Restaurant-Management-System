import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, CheckCircleIcon, FireIcon, BeakerIcon } from '@heroicons/react/24/outline';

const KitchenDisplay = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKitchenOrders();
        const interval = setInterval(fetchKitchenOrders, 5000); // Fast polling for kitchen
        return () => clearInterval(interval);
    }, []);

    const fetchKitchenOrders = async () => {
        try {
            const { data } = await getOrders();
            // Only show Preparing and Ready orders for KDS
            const kitchenOrders = data.filter(order =>
                order.status === 'Pending' || order.status === 'Preparing' || order.status === 'Ready'
            ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first

            setOrders(kitchenOrders);
        } catch (error) {
            console.error("KDS fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusMove = async (id, currentStatus) => {
        let nextStatus = 'Preparing';
        if (currentStatus === 'Preparing') nextStatus = 'Ready';
        if (currentStatus === 'Ready') nextStatus = 'Completed';

        try {
            await updateOrderStatus(id, nextStatus);
            fetchKitchenOrders();
        } catch (error) {
            alert('Status update failed');
        }
    };

    if (loading && orders.length === 0) return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <FireIcon className="w-8 h-8 text-orange-500 animate-pulse" />
                        Kitchen Display System
                    </h1>
                    <p className="text-gray-500 font-medium">Live Order Stream Oldest items first</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-2xl font-bold">{orders.length}</p>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Active Tickets</p>
                    </div>
                    <div className="h-10 w-px bg-gray-800"></div>
                    <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
                        <p className="text-green-400 text-xs font-bold uppercase tracking-widest animate-pulse">● System Live</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: 100 }}
                            className={`flex flex-col rounded-3xl border-2 transition-all duration-500 ${order.status === 'Pending' ? 'border-orange-500/50 bg-orange-500/5' :
                                    order.status === 'Preparing' ? 'border-blue-500/50 bg-blue-500/5' :
                                        'border-green-500/50 bg-green-500/5'
                                }`}
                        >
                            {/* Ticket Header */}
                            <div className={`p-4 rounded-t-[22px] flex justify-between items-center ${order.status === 'Pending' ? 'bg-orange-500/20' :
                                    order.status === 'Preparing' ? 'bg-blue-500/20' :
                                        'bg-green-500/20'
                                }`}>
                                <h2 className="text-xl font-black">TABLE {order.tableNumber}</h2>
                                <div className="flex items-center gap-2 text-sm font-bold opacity-80">
                                    <ClockIcon className="w-4 h-4" />
                                    {Math.floor((new Date() - new Date(order.createdAt)) / 60000)}m
                                </div>
                            </div>

                            {/* Ticket Items */}
                            <div className="p-5 flex-1 space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg font-black text-lg">
                                                {item.quantity}
                                            </span>
                                            <span className="font-bold text-lg">{item.name}</span>
                                        </div>
                                    </div>
                                ))}

                                {order.specialInstructions && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Attention Required</p>
                                        <p className="text-sm font-bold text-gray-200 uppercase">{order.specialInstructions}</p>
                                    </div>
                                )}
                            </div>

                            {/* Ticket Footer (Actions) */}
                            <div className="p-4 bg-white/5 rounded-b-[22px] border-t border-white/5">
                                <button
                                    onClick={() => handleStatusMove(order._id, order.status)}
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${order.status === 'Pending' ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25' :
                                            order.status === 'Preparing' ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25' :
                                                'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
                                        }`}
                                >
                                    {order.status === 'Pending' ? 'Start Fire' :
                                        order.status === 'Preparing' ? 'Mark Ready' : 'Serve / Clear'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {orders.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <CheckCircleIcon className="w-20 h-20 text-gray-800 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-500">Kitchen Clear!</h2>
                    <p className="text-gray-600">Great job chef, no active tickets.</p>
                </div>
            )}
        </div>
    );
};

export default KitchenDisplay;
