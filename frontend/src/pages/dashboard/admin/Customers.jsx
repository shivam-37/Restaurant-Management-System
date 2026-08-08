import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getUsers, deleteUser } from '../../../services/api';
import AuthContext from '../../../context/AuthContext';
import {
    UsersIcon,
    TrashIcon,
    BanknotesIcon,
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-orange-500/5 p-6 rounded-3xl border border-orange-500/10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Customer Registry</h1>
                    <p className="opacity-60 text-sm font-bold uppercase tracking-widest mt-1">Manage platform-wide clientele</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Reach</span>
                    <span className="px-4 py-2 bg-orange-600 text-white rounded-xl text-lg font-black shadow-lg shadow-orange-600/20">
                        {customers.length}
                    </span>
                </div>
            </div>

            <div className="grid gap-6">
                {customers.map((customer) => (
                    <motion.div
                        key={customer._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="theme-card border border-black/5 rounded-[2rem] p-8 hover:border-orange-500/30 transition-all group shadow-sm hover:shadow-2xl"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/20">
                                    {customer.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black text-xl tracking-tight leading-none mb-2">{customer.name}</h3>
                                    <div className="flex items-center opacity-60 text-sm font-bold tracking-tight">
                                        <EnvelopeIcon className="w-4 h-4 mr-2 text-orange-500" />
                                        {customer.email}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 flex-1 md:justify-end w-full md:w-auto">
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Order Density</p>
                                    <div className="flex items-center justify-center md:justify-start font-black text-lg">
                                        <ShoppingBagIcon className="w-5 h-5 mr-3 text-orange-500" />
                                        {customer.orderCount || 0}
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Lifetime Value</p>
                                    <div className="flex items-center justify-center md:justify-start font-black text-lg text-green-600 dark:text-green-400">
                                        <BanknotesIcon className="w-5 h-5 mr-2" />
                                        ₹{(customer.totalSpent || 0).toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <button
                                        onClick={() => handleDelete(customer._id)}
                                        className="p-4 opacity-20 hover:opacity-100 bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 rounded-2xl transition-all group/btn"
                                        title="Revoke Access"
                                    >
                                        <TrashIcon className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {customers.length === 0 && !loading && (
                <div className="text-center py-20 theme-card rounded-[2rem] border border-black/5 border-dashed">
                    <UsersIcon className="h-16 w-16 opacity-10 mx-auto mb-4" />
                    <h3 className="text-xl font-bold opacity-40 uppercase tracking-widest">No customers registered</h3>
                </div>
            )}
        </div>
    );
};

export default Customers;
