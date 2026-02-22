import { useState, useEffect } from 'react';
import { getRestaurant, updateTableStatus } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UserGroupIcon, MapPinIcon, CheckCircleIcon, XCircleIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

// Interactive floor plan component
const TableMap = () => {
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);

    useEffect(() => {
        fetchTableData();
        const interval = setInterval(fetchTableData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchTableData = async () => {
        try {
            const { data } = await getRestaurant();
            setRestaurant(data);
        } catch (error) {
            console.error("Failed to fetch table data");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (number, newStatus) => {
        try {
            await updateTableStatus(number, newStatus);
            fetchTableData();
            setSelectedTable(null);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading && !restaurant) return <div className="animate-pulse text-gray-500">Loading Floor Plan...</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white">Main Dining Floor</h2>
                    <p className="text-sm text-gray-400">Real-time table occupancy tracking</p>
                </div>
                <div className="flex gap-4">
                    {['Available', 'Occupied', 'Reserved', 'Cleaning'].map(status => (
                        <div key={status} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${status === 'Available' ? 'bg-green-500' :
                                status === 'Occupied' ? 'bg-indigo-500' :
                                    status === 'Reserved' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                            <span className="text-xs text-gray-400">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative w-full h-[500px] bg-gray-900/30 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                {restaurant?.tables.map((table) => (
                    <motion.button
                        key={table.number}
                        layoutId={`table-${table.number}`}
                        onClick={() => setSelectedTable(table)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`absolute w-32 h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-colors duration-500 ${table.status === 'Available' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                            table.status === 'Occupied' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                table.status === 'Reserved' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                    'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}
                        style={{ left: `${table.x}%`, top: `${table.y}%` }}
                    >
                        <span className="text-xs font-black opacity-50 uppercase tracking-widest">T-{table.number}</span>
                        <div className="flex -space-x-1">
                            {[...Array(table.capacity)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${table.status === 'Available' ? 'bg-green-500/50' : 'bg-current/40'
                                    }`} />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold uppercase">{table.status}</span>
                    </motion.button>
                ))}

                {/* Legend / Overlay */}
                <div className="absolute bottom-6 left-6 flex gap-3 text-[10px] font-black uppercase text-gray-600">
                    <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> Entrance</span>
                    <span className="flex items-center gap-1"><FireIcon className="w-3 h-3" /> Kitchen</span>
                </div>
            </div>

            {/* Selection Modal */}
            <AnimatePresence>
                {selectedTable && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTable(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-gray-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                            <h3 className="text-2xl font-bold text-white mb-2">Table {selectedTable.number}</h3>
                            <p className="text-gray-400 text-sm mb-6 font-medium">Capacity: {selectedTable.capacity} Guests</p>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {['Available', 'Occupied', 'Reserved', 'Cleaning'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(selectedTable.number, status)}
                                        className={`p-4 rounded-xl border font-bold text-sm transition ${selectedTable.status === status
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setSelectedTable(null)} className="w-full py-3 text-gray-500 font-bold uppercase tracking-widest text-xs hover:text-white transition">Close</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableMap;
