import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        // Poll every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await getOrders();
            // Sort by status priority (Pending > Preparing > Ready > Completed)
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
            Pending: 'bg-yellow-100 text-yellow-800',
            Preparing: 'bg-blue-100 text-blue-800',
            Ready: 'bg-green-100 text-green-800',
            Completed: 'bg-gray-100 text-gray-800',
            Cancelled: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>

            <div className="grid gap-4">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-lg text-gray-900">Table {order.tableNumber}</span>
                                <StatusBadge status={order.status} />
                                <span className="text-sm text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                            </div>
                            <div className="space-y-1">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="text-gray-600 text-sm">
                                        {item.quantity}x {item.name} (${item.price})
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 font-bold text-gray-900">
                                Total: ${order.totalPrice.toFixed(2)}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {order.status === 'Pending' && (
                                <button
                                    onClick={() => handleStatusUpdate(order._id, 'Preparing')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                >
                                    Start Preparing
                                </button>
                            )}
                            {order.status === 'Preparing' && (
                                <button
                                    onClick={() => handleStatusUpdate(order._id, 'Ready')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                >
                                    Mark Ready
                                </button>
                            )}
                            {order.status === 'Ready' && (
                                <button
                                    onClick={() => handleStatusUpdate(order._id, 'Completed')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                                >
                                    Complete
                                </button>
                            )}
                            {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                <button
                                    onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
