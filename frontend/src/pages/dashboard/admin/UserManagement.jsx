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
    EnvelopeIcon
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

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
        </div>
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <ShieldExclamationIcon className="w-5 h-5 text-red-500" />;
            case 'owner':
                return <ShieldCheckIcon className="w-5 h-5 text-purple-500" />;
            default:
                return <UserIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
            case 'owner':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
            default:
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-rose-500/5 p-6 rounded-3xl border border-rose-500/10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">System Users</h1>
                    <p className="opacity-60 text-sm font-bold uppercase tracking-widest mt-1">Super Admin Role Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Accounts</span>
                    <span className="px-4 py-2 bg-rose-600 text-white rounded-xl text-lg font-black shadow-lg shadow-rose-600/20">
                        {users.length}
                    </span>
                </div>
            </div>

            <div className="grid gap-6">
                {users.map((u) => (
                    <motion.div
                        key={u._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="theme-card border border-black/5 rounded-[2rem] p-8 hover:border-rose-500/30 transition-all group shadow-sm hover:shadow-2xl"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                                    {u.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-black text-xl tracking-tight leading-none">{u.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getRoleBadgeColor(u.role)} flex items-center gap-1`}>
                                            {getRoleIcon(u.role)}
                                            {u.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center opacity-60 text-sm font-bold tracking-tight">
                                        <EnvelopeIcon className="w-4 h-4 mr-2 text-rose-500" />
                                        {u.email || u.phone || 'No Contact Info'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end flex-1 w-full md:w-auto gap-4">
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Assign Role</p>
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                        disabled={u._id === currentUser._id}
                                        className="theme-card-item border border-black/10 dark:border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm font-bold focus:outline-none focus:border-rose-500 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="user">User (Customer)</option>
                                        <option value="owner">Owner (Restaurant)</option>
                                        <option value="admin">Admin (System)</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => handleDelete(u._id)}
                                    disabled={u._id === currentUser._id}
                                    className="p-4 mt-6 opacity-40 hover:opacity-100 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-10 rounded-2xl transition-all group/btn"
                                    title={u._id === currentUser._id ? "Cannot delete yourself" : "Delete Account"}
                                >
                                    <TrashIcon className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {users.length === 0 && !loading && (
                <div className="text-center py-20 theme-card rounded-[2rem] border border-black/5 border-dashed">
                    <UsersIcon className="h-16 w-16 opacity-10 mx-auto mb-4" />
                    <h3 className="text-xl font-bold opacity-40 uppercase tracking-widest">No users found</h3>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
