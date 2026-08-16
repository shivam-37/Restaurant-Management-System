import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { ArchiveBoxIcon, PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Inventory = () => {
    const { selectedRestaurant } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        quantity: 0,
        unit: 'kg',
        costPerUnit: 0,
        lowStockThreshold: 10
    });

    useEffect(() => {
        if (selectedRestaurant) {
            fetchInventory();
        }
    }, [selectedRestaurant]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const { data } = await getInventory(selectedRestaurant._id);
            setInventory(data);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                costPerUnit: item.costPerUnit,
                lowStockThreshold: item.lowStockThreshold
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                quantity: 0,
                unit: 'kg',
                costPerUnit: 0,
                lowStockThreshold: 10
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...formData, restaurantId: selectedRestaurant._id };
            if (editingItem) {
                await updateInventoryItem(editingItem._id, dataToSubmit);
            } else {
                await createInventoryItem(dataToSubmit);
            }
            setIsModalOpen(false);
            fetchInventory();
        } catch (error) {
            console.error("Failed to save inventory item", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteInventoryItem(id);
                fetchInventory();
            } catch (error) {
                console.error("Failed to delete inventory item", error);
            }
        }
    };

    if (!selectedRestaurant) {
        return (
            <div className="flex flex-col items-center justify-center h-96 opacity-40">
                <ArchiveBoxIcon className="w-16 h-16 mb-4" />
                <p className="font-bold uppercase tracking-widest text-sm">Please select a restaurant</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <ArchiveBoxIcon className="w-6 h-6 text-orange-500" /> Inventory Management
                    </h2>
                    <p className="opacity-60 text-sm font-medium mt-1">Track ingredients and stock levels</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/20"
                >
                    <PlusIcon className="w-4 h-4" /> Add Item
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                </div>
            ) : inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-40 theme-card rounded-[2rem] border border-black/5">
                    <ArchiveBoxIcon className="w-16 h-16 mb-4" />
                    <p className="font-bold uppercase tracking-widest text-sm">No inventory items found</p>
                </div>
            ) : (
                <div className="theme-card rounded-[2rem] border border-black/5 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                <tr>
                                    <th className="px-6 py-4">Item Name</th>
                                    <th className="px-6 py-4">Stock Level</th>
                                    <th className="px-6 py-4">Cost / Unit</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                {inventory.map((item) => {
                                    const isLowStock = item.quantity <= item.lowStockThreshold;
                                    return (
                                        <tr key={item._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition group">
                                            <td className="px-6 py-4 font-bold uppercase tracking-wider text-sm">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <span className={isLowStock ? 'text-red-500 font-bold' : ''}>
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                                                ₹{item.costPerUnit}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isLowStock ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        <ExclamationTriangleIcon className="w-3 h-3" /> Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        In Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleOpenModal(item)} className="p-2 theme-card-item rounded-xl hover:text-orange-500 transition">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-2 theme-card-item rounded-xl hover:text-red-500 transition">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md theme-card border border-black/10 shadow-2xl rounded-[2rem] overflow-hidden">
                            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-black/5">
                                <h3 className="text-xl font-black uppercase tracking-tighter">{editingItem ? 'Edit Item' : 'New Item'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Item Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Quantity</label>
                                        <input type="number" step="0.01" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })} className="w-full bg-black/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Unit</label>
                                        <input type="text" placeholder="kg, L, pcs..." value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-black/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Cost / Unit (₹)</label>
                                        <input type="number" step="0.01" value={formData.costPerUnit} onChange={e => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })} className="w-full bg-black/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Low Stock Alert</label>
                                        <input type="number" step="0.01" value={formData.lowStockThreshold} onChange={e => setFormData({ ...formData, lowStockThreshold: parseFloat(e.target.value) })} className="w-full bg-black/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-black/5">
                                    <button type="submit" className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-600/30 transition">
                                        {editingItem ? 'Save Changes' : 'Add Item'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
