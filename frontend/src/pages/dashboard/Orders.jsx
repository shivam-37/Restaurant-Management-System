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
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-500/20">
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-400 mb-3 flex items-center gap-2">
                <StarIcon className="w-4 h-4" /> Rate your experience
            </p>
            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-90"
                    >
                        {star <= rating ? (
                            <StarIcon className="w-6 h-6 text-yellow-400" />
                        ) : (
                            <StarOutline className="w-6 h-6 text-gray-300" />
                        )}
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your feedback..."
                className="w-full p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition mb-3"
                rows="2"
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

const Orders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await getOrders();
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
            alert('Failed to update order status');
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            Preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            Ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            Completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {(user?.role === 'admin' || user?.role === 'staff') ? 'Order Flow' : 'My Orders'}
                    </h1>
                    <p className="text-gray-400 text-sm">Real-time status tracking for all orders</p>
                </div>
            </div>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
                        <ShoppingBagIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-6 rounded-2xl border border-gray-800/50 shadow-xl backdrop-blur-sm"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                            #{order.tableNumber}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-white">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 bg-black/20 p-4 rounded-xl">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-300">{item.quantity}x {item.name}</span>
                                                <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                                            <span className="text-lg font-bold text-indigo-400">${order.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {order.specialInstructions && (
                                        <div className="mb-4 flex gap-2 items-start opacity-70">
                                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                                            <p className="text-xs italic text-gray-400">"{order.specialInstructions}"</p>
                                        </div>
                                    )}

                                    {/* User Review Section */}
                                    {user?.role === 'user' && order.status === 'Completed' && (
                                        !order.review ? (
                                            <ReviewForm orderId={order._id} onReviewSubmitted={fetchOrders} />
                                        ) : (
                                            <div className="mt-4 p-4 bg-green-500/5 rounded-xl border border-green-500/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex gap-1">
                                                        {[...Array(order.review.rating)].map((_, i) => (
                                                            <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.review.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' : order.review.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {order.review.sentiment} Vibe
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400">"{order.review.comment}"</p>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Admin Actions */}
                                {(user?.role === 'admin' || user?.role === 'staff') && (
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        {order.status === 'Pending' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Preparing')}
                                                className="w-full px-6 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-xl hover:bg-indigo-600 hover:text-white transition font-bold text-sm"
                                            >
                                                Accept & Prepare
                                            </button>
                                        )}
                                        {order.status === 'Preparing' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Ready')}
                                                className="w-full px-6 py-3 bg-green-600/10 text-green-400 border border-green-600/20 rounded-xl hover:bg-green-600 hover:text-white transition font-bold text-sm"
                                            >
                                                Mark as Ready
                                            </button>
                                        )}
                                        {order.status === 'Ready' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Completed')}
                                                className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition font-bold text-sm shadow-lg"
                                            >
                                                Finish Order
                                            </button>
                                        )}
                                        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                                className="w-full px-6 py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition font-bold text-sm"
                                            >
                                                Decline
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
