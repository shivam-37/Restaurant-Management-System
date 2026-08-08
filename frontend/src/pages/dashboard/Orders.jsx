import { useState, useEffect, useContext } from 'react';
import { getOrders, updateOrderStatus, addOrderReview } from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { StarIcon, ChatBubbleBottomCenterTextIcon, HandThumbUpIcon, HandThumbDownIcon, FaceSmileIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewForm = ({ orderId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addOrderReview(orderId, { rating, comment });
            onReviewSubmitted();
        } catch (error) {
            alert('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 p-6 theme-card-item rounded-2xl border border-rose-500/10 shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-4 flex items-center gap-2">
                <StarIcon className="w-4 h-4" /> Order Feedback
            </p>
            <div className="flex gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-all active:scale-90 hover:scale-110"
                    >
                        {star <= rating ? (
                            <StarIcon className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                        ) : (
                            <StarOutline className="w-8 h-8 opacity-20" />
                        )}
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
                className="w-full theme-card rounded-xl p-4 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 focus:outline-none transition-all mb-4 placeholder:opacity-30 border border-black/5"
                rows="3"
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 disabled:opacity-50 active:scale-95"
            >
                {isSubmitting ? 'Sending...' : 'Submit Review'}
            </button>
        </form>
    );
};

const Orders = () => {
    const { user, selectedRestaurant } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [selectedRestaurant?._id]);

    const fetchOrders = async () => {
        try {
            const { data } = await getOrders(selectedRestaurant?._id);
            const statusPriority = { Pending: 0, Preparing: 1, Ready: 2, Completed: 3, Cancelled: 4 };
            const sortedOrders = data.sort((a, b) => {
                if (statusPriority[a.status] !== statusPriority[b.status]) {
                    return statusPriority[a.status] - statusPriority[b.status];
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setOrders(sortedOrders);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            fetchOrders();
        } catch (error) {
            console.error('Status update failed:', error.response?.data || error.message);
            alert(`Failed to update order status: ${error.response?.data?.message || error.message}`);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            Pending: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
            Preparing: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
            Ready: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
            Completed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
            Cancelled: 'bg-orange-500/10 text-[#f97316] dark:text-red-400 border border-red-500/20'
        };
        return (
            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${colors[status] || 'bg-black/5 dark:bg-white/5'}`}>
                {status}
            </span>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-3">
                        {(user?.role === 'admin' || user?.role === 'owner') ? 'Manage Orders' : 'My Orders'}
                    </h1>
                    <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">Monitor your orders in real-time</p>
                </div>
                <div className="flex items-center gap-3 bg-rose-500/5 px-6 py-3 rounded-2xl border border-rose-500/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">System Online</span>
                </div>
            </div>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 theme-card rounded-3xl border-dashed">
                        <ShoppingBagIcon className="w-12 h-12 opacity-20 mx-auto mb-4" />
                        <p className="opacity-50">No orders found</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="theme-card p-6 rounded-2xl shadow-xl shadow-black/5"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 font-bold border border-rose-500/20">
                                            {(order.orderType === 'Home Delivery' || order.tableNumber === 0) ? '🛵' : order.tableNumber}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold">
                                                    {(order.orderType === 'Home Delivery' || order.tableNumber === 0) ? 'Home Delivery' : `Table ${order.tableNumber}`}
                                                </h3>
                                                {!selectedRestaurant && (
                                                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-md text-[10px] font-black uppercase tracking-wider border border-rose-500/10">
                                                        {order.restaurant?.name || 'Local'}
                                                    </span>
                                                )}
                                                <StatusBadge status={order.status} />
                                                {order.orderType && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${order.orderType === 'Home Delivery'
                                                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                                                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                        }`}>
                                                        {order.orderType === 'Home Delivery' ? '🛵 Delivery' : '🍽️ Dine-In'}
                                                    </span>
                                                )}
                                                {order.paymentMethod && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                                                        {order.paymentMethod === 'Cash' ? '💵' : order.paymentMethod === 'Card' ? '💳' : '📱'} {order.paymentMethod}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs opacity-60">{(order.items || []).length} items • ₹{(order.totalPrice || 0).toFixed(2)}</p>
                                            {order.orderType === 'Home Delivery' && order.deliveryAddress && (
                                                <p className="text-xs text-orange-500 font-medium mt-0.5">📍 {order.deliveryAddress}</p>
                                            )}
                                            <p className="text-[10px] opacity-40 mt-1">
                                                Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                     <div className="space-y-2 mb-4 theme-card-item p-4 rounded-xl border border-black/5">
                                        {(order.items || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="opacity-80">{item.quantity}x {item.name}</span>
                                                <span className="opacity-60">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-black/5 flex justify-between items-center">
                                            <span className="text-xs font-bold opacity-40 uppercase tracking-wider">Total</span>
                                            <span className="text-lg font-bold text-rose-500">₹{(order.totalPrice || 0).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {order.specialInstructions && (
                                        <div className="mb-4 flex gap-2 items-start opacity-70">
                                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-rose-500 mt-0.5" />
                                            <p className="text-xs italic opacity-80">"{order.specialInstructions}"</p>
                                        </div>
                                    )}

                                    {/* User Review Section */}
                                    {user?.role === 'user' && order.status === 'Completed' && (
                                        !order.review ? (
                                            <ReviewForm orderId={order._id} onReviewSubmitted={fetchOrders} />
                                        ) : (
                                            <div className="mt-4 p-4 theme-card-item rounded-xl border border-green-500/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex gap-1">
                                                        {[...Array(order.review.rating)].map((_, i) => (
                                                            <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.review.sentiment === 'Positive' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : order.review.sentiment === 'Negative' ? 'bg-orange-500/20 text-[#f97316] dark:text-red-400' : 'bg-slate-500/20 text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                        {order.review.sentiment} Experience
                                                    </span>
                                                </div>
                                                <p className="text-sm opacity-70">"{order.review.comment}"</p>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Admin/Owner Actions */}
                                {(user?.role === 'admin' || user?.role === 'owner') && (
                                    <div className="flex flex-col gap-3 w-full md:w-auto">
                                        {order.status === 'Pending' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Preparing')}
                                                className="w-full px-8 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/30"
                                            >
                                                Start Cooking
                                            </button>
                                        )}
                                        {order.status === 'Preparing' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Ready')}
                                                className="w-full px-8 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/30"
                                            >
                                                Ready for Pickup
                                            </button>
                                        )}
                                        {order.status === 'Ready' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Completed')}
                                                className="w-full px-8 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/30"
                                            >
                                                Complete Order
                                            </button>
                                        )}
                                        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                                className="w-full px-8 py-4 theme-card-item border border-red-500/20 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;
