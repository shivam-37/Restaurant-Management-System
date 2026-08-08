import { useState, useEffect, useContext } from 'react';
import { getUsers, deleteUser } from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { TrashIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

const Customers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                fetchUsers();
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Customers</h1>
                    <p className="opacity-60 font-medium mt-1">Manage and view your restaurant's clientele</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <MagnifyingGlassIcon className="h-5 w-5 text-rose-500 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="w-full theme-card-item border-transparent rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-rose-500 transition font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="theme-card rounded-[2rem] border border-black/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-black/5 bg-rose-500/5">
                                <th className="px-8 py-5 text-[10px] font-black text-rose-500 uppercase tracking-widest">User Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-rose-500 uppercase tracking-widest">Access Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-rose-500 uppercase tracking-widest">Member Since</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-rose-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filteredUsers.map((u) => (
                                <tr key={u._id} className="hover:bg-black/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-500/20">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{u.name}</p>
                                                <p className="text-xs opacity-50 font-medium">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${u.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-bold opacity-60 uppercase tracking-tighter">
                                            {new Date(u.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {u._id !== user._id ? (
                                            <button
                                                onClick={() => handleDelete(u._id)}
                                                className="p-2 opacity-30 hover:opacity-100 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all"
                                                title="Delete Customer"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-20">You</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-16 text-center">
                        <UserIcon className="h-16 w-16 opacity-10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold opacity-40">No customers found</h3>
                        <p className="text-sm opacity-20 italic">Try searching with a different term</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customers;
