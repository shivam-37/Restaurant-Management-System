import { useState, useEffect, useContext } from 'react';
import { getRestaurantDetails, updateTableStatus, getRestaurants } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UserGroupIcon, MapPinIcon, CheckCircleIcon, XCircleIcon, ClockIcon, FireIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import AuthContext from '../../../context/AuthContext';

// Interactive floor plan component
const TableMap = () => {
    const { selectedRestaurant, setSelectedRestaurant } = useContext(AuthContext);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        if (!selectedRestaurant) {
            fetchRestaurants();
        } else {
            fetchTableData();
            const interval = setInterval(fetchTableData, 10000);
            return () => clearInterval(interval);
        }
    }, [selectedRestaurant?._id]);

    const fetchRestaurants = async () => {
        try {
            const { data } = await getRestaurants();
            setRestaurants(data);
        } catch (error) {
            console.error("Failed to fetch restaurants");
        } finally {
            setLoading(false);
        }
    };

    const fetchTableData = async () => {
        if (!selectedRestaurant) return;
        try {
            const { data } = await getRestaurantDetails(selectedRestaurant._id);
            setRestaurant(data);
        } catch (error) {
            console.error("Failed to fetch table data");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (number, newStatus) => {
        try {
            await updateTableStatus(selectedRestaurant._id, number, newStatus);
            fetchTableData();
            setSelectedTable(null);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading && !restaurant && selectedRestaurant) return (
        <div className="flex flex-col items-center justify-center h-64 theme-card rounded-3xl opacity-50 space-y-4">
            <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black uppercase tracking-widest text-[10px]">Loading Table Map...</p>
        </div>
    );

    if (!selectedRestaurant) {
        return (
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-rose-500/5 p-8 rounded-[2.5rem] border border-rose-500/10">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Table Layout</h2>
                        <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Select a restaurant to view the table map</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {restaurants.map((r, idx) => (
                        <motion.button
                            key={r._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => {
                                setSelectedRestaurant(r);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group relative theme-card rounded-[2rem] p-10 text-left hover:border-rose-500 transition-all overflow-hidden shadow-sm hover:shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-400 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-xl shadow-rose-600/20 group-hover:scale-110 transition-transform">
                                    {r.name.charAt(0)}
                                </div>
                                <h3 className="text-2xl font-black tracking-tighter mb-2">{r.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-10">{r.cuisine} Style • {r.tables?.length || 0} Tables</p>

                                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest pt-8 border-t border-black/5">
                                    View Tables
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Dining Area</h2>
                    <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Table status and availability</p>
                </div>
                <div className="flex flex-wrap gap-6 p-4 theme-card-item rounded-2xl border border-black/5">
                    {['Available', 'Occupied', 'Reserved', 'Cleaning'].map(status => (
                        <div key={status} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full shadow-sm ${status === 'Available' ? 'bg-green-500' :
                                status === 'Occupied' ? 'bg-rose-600' :
                                    status === 'Reserved' ? 'bg-yellow-500' : 'bg-orange-500'
                                }`} />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative w-full overflow-auto rounded-[3rem] border border-black/5 backdrop-blur-sm shadow-2xl scrollbar-hide" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="relative min-w-[800px] h-[600px]">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, currentColor 1.5px, transparent 0)', backgroundSize: '50px 50px' }} />

                    {restaurant?.tables.map((table, idx) => {
                        let posX = table.x;
                        let posY = table.y;

                        if (posX === 0 && posY === 0) {
                            const cols = 5;
                            const spacing = 18;
                            const margin = 8;
                            posX = margin + (idx % cols) * spacing;
                            posY = margin + Math.floor(idx / cols) * spacing;
                        }

                        return (
                            <motion.button
                                key={table.number}
                                layoutId={`table-${table.number}`}
                                onClick={() => setSelectedTable(table)}
                                whileHover={{ scale: 1.05, zIndex: 20 }}
                                whileTap={{ scale: 0.95 }}
                                className={`absolute w-36 h-36 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-500 shadow-lg ${table.status === 'Available' ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/20' :
                                    table.status === 'Occupied' ? 'bg-rose-600/10 border-rose-600/30 text-rose-700 dark:text-rose-400 hover:bg-rose-600/20' :
                                        table.status === 'Reserved' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20' :
                                            'bg-orange-500/10 border-red-500/30 text-red-700 dark:text-red-400 hover:bg-orange-500/20'
                                    }`}
                                style={{ left: `${posX}%`, top: `${posY}%` }}
                            >
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">TABLE-{table.number}</span>
                                <div className="flex -space-x-1.5">
                                    {[...Array(table.capacity)].map((_, i) => (
                                        <div key={i} className={`w-3 h-3 rounded-full border border-black/5 ${table.status === 'Available' ? 'bg-green-500/50' : 'bg-current opacity-40'
                                            }`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{table.status}</span>
                            </motion.button>
                        );
                    })}

                    {/* Legend / Overlay */}
                    <div className="absolute bottom-8 left-8 flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                        <span className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> Entry Point</span>
                        <span className="flex items-center gap-2"><FireIcon className="w-4 h-4 ml-4" /> Kitchen</span>
                    </div>
                </div>
            </div>

            {/* Selection Modal */}
            <AnimatePresence>
                {selectedTable && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTable(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative theme-card p-10 rounded-[3rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-black/5 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setSelectedTable(null)} className="opacity-20 hover:opacity-100 transition-opacity">
                                    <XCircleIcon className="w-8 h-8" />
                                </button>
                            </div>
                            <div className="flex items-center gap-6 mb-8">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${selectedTable.status === 'Available' ? 'bg-green-500 text-white' :
                                    selectedTable.status === 'Occupied' ? 'bg-rose-600 text-white' :
                                        selectedTable.status === 'Reserved' ? 'bg-yellow-500 text-white' : 'bg-orange-500 text-white'
                                    }`}>
                                    {selectedTable.number}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter">Table Details</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Capacity: {selectedTable.capacity} Guests</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                {['Available', 'Occupied', 'Reserved', 'Cleaning'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(selectedTable.number, status)}
                                        className={`p-5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${selectedTable.status === status
                                            ? 'bg-rose-600 border-rose-500 text-white shadow-xl shadow-rose-600/30 ring-4 ring-rose-600/10'
                                            : 'theme-card-item opacity-40 border-black/5 hover:opacity-100 hover:border-rose-500/50'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setSelectedTable(null)} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-20 hover:opacity-100 transition-all">Close</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableMap;
