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

    if (loading && !restaurant && selectedRestaurant) return <div className="animate-pulse text-gray-500">Loading Floor Plan...</div>;

    if (!selectedRestaurant) {
        return (
            <div className="p-8">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">Establishment Floor Plans</h2>
                    <p className="text-gray-400">Select a restaurant to view and manage its real-time table occupancy</p>
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
                            className="group relative bg-gray-900/40 border border-gray-800 rounded-3xl p-8 text-left hover:border-indigo-500/50 transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                    {r.name.charAt(0)}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{r.name}</h3>
                                <p className="text-sm text-gray-500 mb-6">{r.cuisine} Cuisine • {r.tables?.length || 0} Tables</p>

                                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest pt-6 border-t border-gray-800">
                                    View Live Map
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

                {restaurant?.tables.map((table, idx) => {
                    // Logic to handle 0,0 coordinates - spread them in a grid
                    let posX = table.x;
                    let posY = table.y;

                    if (posX === 0 && posY === 0) {
                        const cols = 4;
                        const spacing = 20;
                        const margin = 10;
                        posX = margin + (idx % cols) * spacing;
                        posY = margin + Math.floor(idx / cols) * spacing;
                    }

                    return (
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
                            style={{ left: `${posX}%`, top: `${posY}%` }}
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
                    );
                })}

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
