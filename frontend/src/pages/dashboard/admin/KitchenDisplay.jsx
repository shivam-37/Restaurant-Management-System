import { useState, useEffect, useContext } from 'react';
import { getOrders, updateOrderStatus } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, CheckCircleIcon, FireIcon, BeakerIcon } from '@heroicons/react/24/outline';
import AuthContext from '../../../context/AuthContext';

const KitchenDisplay = () => {
    const { selectedRestaurant } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKitchenOrders();
        const interval = setInterval(fetchKitchenOrders, 5000); // Fast polling for kitchen
        return () => clearInterval(interval);
    }, [selectedRestaurant?._id]);

    const fetchKitchenOrders = async () => {
        try {
            const { data } = await getOrders(selectedRestaurant?._id);
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

    const [updating, setUpdating] = useState(null); // track which order is being updated

    const handleStatusMove = async (id, currentStatus) => {
        if (updating === id) return; // prevent double-click
        let nextStatus = 'Preparing';
        if (currentStatus === 'Preparing') nextStatus = 'Ready';
        if (currentStatus === 'Ready') nextStatus = 'Completed';

        setUpdating(id);
        try {
            await updateOrderStatus(id, nextStatus);
            fetchKitchenOrders();
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Status update failed';
            alert(`Error: ${message}`);
        } finally {
            setUpdating(null);
        }
    };

    if (loading && orders.length === 0) return (
        <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-6 min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                        <FireIcon className="w-10 h-10 text-orange-500 animate-pulse" />
                        Kitchen Orders
                    </h1>
                    <p className="opacity-50 font-black uppercase tracking-widest text-[10px] mt-1">Live Order List  Priority: Oldest to Newest</p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-3xl font-black">{orders.length}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black">Active Orders</p>
                    </div>
                    <div className="h-12 w-px bg-black/5 dark:bg-white/10"></div>
                    <div className="bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-2xl">
                        <p className="text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest animate-pulse">● System Online</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence>
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: 100 }}
                            className={`flex flex-col rounded-[2rem] border-2 transition-all duration-500 shadow-xl ${order.status === 'Pending' ? 'border-orange-500/50 bg-orange-500/5' :
                                order.status === 'Preparing' ? 'border-rose-500/50 bg-rose-500/5' :
                                    'border-green-500/50 bg-green-500/5'
                                }`}
                        >
                            {/* Ticket Header */}
                            <div className={`p-5 rounded-t-[1.8rem] flex justify-between items-center ${order.status === 'Pending' ? 'bg-orange-500 text-white' :
                                order.status === 'Preparing' ? 'bg-rose-600 text-white' :
                                    'bg-green-600 text-white'
                                }`}>
                                <h2 className="text-xl font-black">TABLE {order.tableNumber}</h2>
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-80">
                                    <ClockIcon className="w-4 h-4" />
                                    {Math.floor((new Date() - new Date(order.createdAt)) / 60000)}m Ago
                                </div>
                            </div>

                            {/* Ticket Items */}
                            <div className="p-6 flex-1 space-y-4">
                                {(order.items || []).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center theme-card-item opacity-80 p-4 rounded-2xl border border-black/5">
                                        <div className="flex items-center gap-4">
                                            <span className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl font-black text-xl">
                                                {item.quantity}
                                            </span>
                                            <span className="font-black text-lg tracking-tight">{item.name}</span>
                                        </div>
                                    </div>
                                ))}

                                {order.specialInstructions && (
                                    <div className="mt-6 p-4 bg-orange-500/10 border border-red-500/20 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Attention Required</p>
                                        <p className="text-xs font-bold uppercase tracking-tight opacity-80">{order.specialInstructions}</p>
                                    </div>
                                )}
                            </div>

                            {/* Ticket Footer (Actions) */}
                            <div className="p-5 theme-card-item rounded-b-[1.8rem] border-t border-black/5">
                                <button
                                    onClick={() => handleStatusMove(order._id, order.status)}
                                    disabled={updating === order._id}
                                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${order.status === 'Pending' ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30' :
                                        order.status === 'Preparing' ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30' :
                                            'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30'
                                        }`}
                                >
                                    {updating === order._id ? '⏳ Processing...' :
                                        order.status === 'Pending' ? 'Start Cooking' :
                                            order.status === 'Preparing' ? 'Ready for Pickup' : 'Done'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {orders.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center theme-card rounded-[3rem] border border-black/5 border-dashed max-w-2xl mx-auto">
                    <CheckCircleIcon className="w-24 h-24 opacity-10 mb-6" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter opacity-40">No Orders</h2>
                    <p className="opacity-20 font-bold uppercase tracking-widest text-xs mt-2 italic">All orders completed</p>
                </div>
            )}
        </div>
    );
};

export default KitchenDisplay;
