import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getAllUsers, updateUserRole, deleteUser } from '../../../services/api';
import AuthContext from '../../../context/AuthContext';
import {
    UsersIcon,
    TrashIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const { data } = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch all users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            try {
                await updateUserRole(id, newRole);
                fetchAllUsers(); // Refresh the list
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to update user role');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('CRITICAL WARNING: Are you sure you want to permanently delete this user? This cannot be undone.')) {
            try {
                await deleteUser(id);
                fetchAllUsers(); // Refresh the list
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const stats = {
        total: users.length,
        owners: users.filter(u => u.role === 'owner').length,
        customers: users.filter(u => u.role === 'user').length,
        admins: users.filter(u => u.role === 'admin').length,
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
                    <h1 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter">
                        <ShieldExclamationIcon className="w-8 h-8 text-orange-500" />
                        System Users
                    </h1>
                    <p className="opacity-60 text-sm font-bold uppercase tracking-widest mt-1">Manage all users, owners, and system settings.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats.total, icon: <UsersIcon className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Restaurant Owners', value: stats.owners, icon: <BuildingOfficeIcon className="w-6 h-6" />, color: 'from-indigo-500 to-purple-500', bgColor: 'bg-orange-500/10', textColor: 'text-[#f97316] dark:text-indigo-400' },
                    { label: 'Customers', value: stats.customers, icon: <ChartBarIcon className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Administrators', value: stats.admins, icon: <ShieldCheckIcon className="w-6 h-6" />, color: 'from-orange-500 to-pink-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400' }
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="theme-card rounded-2xl p-6 border border-black/5 hover:border-orange-500/30 transition-all shadow-sm group relative overflow-hidden"
                    >
                        <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
                                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg flex items-center justify-center text-white`}>
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Users Table */}
            <div className="theme-card rounded-[2rem] shadow-sm border border-black/5 overflow-hidden">
                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-orange-500/5">
                    <h2 className="text-xl font-black uppercase tracking-tighter">User Management Table</h2>
                    <button onClick={fetchAllUsers} className="text-xs font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition">
                        Refresh Data
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                            <tr>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Contact</th>
                                <th className="px-8 py-5 text-center">Role</th>
                                <th className="px-8 py-5 text-center">Joined</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center">
                                        <UsersIcon className="h-12 w-12 opacity-10 mx-auto mb-4" />
                                        <span className="opacity-40 font-bold uppercase tracking-widest text-xs">No users found</span>
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u._id} className="group hover:bg-black/5 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">
                                                {u.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black tracking-tight">{u.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col space-y-1">
                                            {u.email && <span className="flex items-center text-[10px] font-bold opacity-60 tracking-tight"><EnvelopeIcon className="w-3 h-3 mr-1 text-orange-500" /> {u.email}</span>}
                                            {u.phone && <span className="flex items-center text-[10px] font-bold opacity-60 tracking-tight"><PhoneIcon className="w-3 h-3 mr-1 text-orange-500" /> {u.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <select 
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            disabled={u._id === currentUser._id}
                                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-black/5 cursor-pointer disabled:opacity-50 ${
                                                u.role === 'admin' ? 'bg-orange-500/10 text-[#f97316] dark:text-red-400 border-red-500/20' :
                                                u.role === 'owner' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                                'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                            }`}
                                        >
                                            <option value="user" className="bg-white text-black dark:bg-gray-900 dark:text-white">User</option>
                                            <option value="owner" className="bg-white text-black dark:bg-gray-900 dark:text-white">Owner</option>
                                            <option value="admin" className="bg-white text-black dark:bg-gray-900 dark:text-white">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-6 text-center text-[10px] font-bold opacity-60 tracking-tight">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => handleDelete(u._id)}
                                            disabled={u._id === currentUser._id}
                                            className="p-2 opacity-40 group-hover:opacity-100 bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 disabled:opacity-10 rounded-xl transition-all"
                                            title={u._id === currentUser._id ? "Cannot delete yourself" : "Delete Account"}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
