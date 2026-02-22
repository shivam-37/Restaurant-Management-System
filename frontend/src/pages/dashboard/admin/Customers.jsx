import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getUsers, deleteUser } from '../../../services/api';
import AuthContext from '../../../context/AuthContext';
import {
    UsersIcon,
    TrashIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

const Customers = () => {
    const { selectedRestaurant } = useContext(AuthContext);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, [selectedRestaurant?._id]);

    const fetchCustomers = async () => {
        try {
            const { data } = await getUsers(selectedRestaurant?._id);
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this customer?')) {
            try {
                await deleteUser(id);
                fetchCustomers();
            } catch (error) {
                alert('Failed to delete customer');
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Customer Management</h1>
                <span className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-sm border border-indigo-500/20">
                    Total: {customers.length}
                </span>
            </div>

            <div className="grid gap-4">
                {customers.map((customer) => (
                    <motion.div
                        key={customer._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                    {customer.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{customer.name}</h3>
                                    <div className="flex items-center text-gray-400 text-sm mt-1">
                                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                                        {customer.email}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 md:justify-end">
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Orders</p>
                                    <div className="flex items-center justify-center md:justify-start text-white font-semibold">
                                        <ShoppingBagIcon className="w-4 h-4 mr-2 text-indigo-400" />
                                        {customer.orderCount || 0}
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Spent</p>
                                    <div className="flex items-center justify-center md:justify-start text-white font-semibold">
                                        <CurrencyDollarIcon className="w-4 h-4 mr-1 text-green-400" />
                                        ${customer.totalSpent || '0.00'}
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center justify-end">
                                    <button
                                        onClick={() => handleDelete(customer._id)}
                                        className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Customers;
