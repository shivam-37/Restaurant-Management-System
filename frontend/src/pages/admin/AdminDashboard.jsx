import React, { useState, useEffect } from 'react';
import { Shield, Users, Building, Activity, Trash2, Mail, Phone, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllUsers, deleteUser, updateUserRole } from '../../services/api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                setUsers(users.filter(u => u._id !== id));
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await updateUserRole(id, newRole);
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role');
        }
    };

    const stats = {
        total: users.length,
        owners: users.filter(u => u.role === 'owner').length,
        customers: users.filter(u => u.role === 'user').length,
        admins: users.filter(u => u.role === 'admin').length,
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Shield className="w-8 h-8 text-indigo-500" />
                            System Administration
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage all users, owners, and system settings.</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Users', value: stats.total, icon: <Users className="w-6 h-6" />, color: 'bg-blue-500' },
                        { label: 'Restaurant Owners', value: stats.owners, icon: <Building className="w-6 h-6" />, color: 'bg-indigo-500' },
                        { label: 'Customers', value: stats.customers, icon: <Activity className="w-6 h-6" />, color: 'bg-emerald-500' },
                        { label: 'Administrators', value: stats.admins, icon: <Shield className="w-6 h-6" />, color: 'bg-rose-500' }
                    ].map((stat, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4"
                        >
                            <div className={`${stat.color} p-4 rounded-xl text-white`}>
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold">User Management</h2>
                        <button onClick={fetchUsers} className="text-indigo-500 hover:text-indigo-600 font-medium text-sm">
                            Refresh Data
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-red-500">{error}</td>
                                    </tr>
                                ) : users.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <td className="px-6 py-4 font-medium flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                                                {u.name.charAt(0)}
                                            </div>
                                            <span>{u.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                {u.email && <span className="flex items-center text-xs"><Mail className="w-3 h-3 mr-1" /> {u.email}</span>}
                                                {u.phone && <span className="flex items-center text-xs"><Phone className="w-3 h-3 mr-1" /> {u.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${
                                                    u.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                    u.role === 'owner' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                }`}
                                            >
                                                <option value="user">User</option>
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="text-gray-400 hover:text-red-500 transition"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
