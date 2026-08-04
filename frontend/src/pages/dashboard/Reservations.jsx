import { useState, useEffect, useContext } from 'react';
import { getReservations, createReservation, updateReservationStatus, getMyReservations, getOccupiedReservationTables } from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusIcon,
    CalendarIcon,
    UserGroupIcon,
    ClockIcon,
    XMarkIcon,
    PhoneIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const Reservations = () => {
    const { user, selectedRestaurant } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: '',
        date: '',
        time: '',
        partySize: 2,
        tableNumber: ''
    });
    const [occupiedTables, setOccupiedTables] = useState([]);

    useEffect(() => {
        fetchReservations();
    }, [selectedRestaurant?._id, user?.role]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const { data } = (user.role === 'admin' || user.role === 'owner')
                ? await getReservations(selectedRestaurant?._id)
                : await getMyReservations(selectedRestaurant?._id);
            setReservations(data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchOccupied = async () => {
            if (formData.date && formData.time && selectedRestaurant) {
                try {
                    const { data } = await getOccupiedReservationTables(selectedRestaurant._id, formData.date, formData.time);
                    setOccupiedTables(data);
                } catch (err) {
                    console.error("Failed to fetch occupied tables", err);
                }
            } else {
                setOccupiedTables([]);
            }
        };
        fetchOccupied();
    }, [formData.date, formData.time, selectedRestaurant]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRestaurant) {
            alert('Please select a restaurant first');
            return;
        }
        try {
            if (!formData.tableNumber) {
                alert('Please select a table');
                return;
            }
            await createReservation({ ...formData, restaurantId: selectedRestaurant._id });
            fetchReservations();
            setIsModalOpen(false);
            setFormData({ ...formData, date: '', time: '', tableNumber: '' });
        } catch (error) {
            alert(`Failed to book reservation: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateReservationStatus(id, status);
            fetchReservations();
        } catch (error) {
            console.error('Status Update Error:', error.response?.data || error);
            alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">
                        {(user.role === 'admin' || user.role === 'owner') ? 'Bookings' : 'My Bookings'}
                    </h1>
                    <p className="opacity-60 font-medium">
                        {(user.role === 'admin' || user.role === 'owner')
                            ? `Incoming reservations for ${selectedRestaurant?.name || 'All Locations'}`
                            : `Your upcoming visits to ${selectedRestaurant?.name || 'our restaurants'}`}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-all group"
                >
                    <PlusIcon className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                    New Reservation
                </motion.button>
            </motion.div>

            {/* List Section */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-rose-500/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : reservations.length === 0 ? (
                <motion.div
                    {...fadeInUp}
                    className="theme-card border-2 border-dashed border-black/5 rounded-3xl p-16 text-center"
                >
                    <CalendarIcon className="h-16 w-16 text-rose-500/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Reservations Found</h3>
                    <p className="opacity-50 max-w-xs mx-auto mb-8">It looks like there are no bookings scheduled here yet.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {reservations.map((res, idx) => (
                            <motion.div
                                key={res._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group theme-card border border-black/5 hover:border-rose-500/30 rounded-3xl p-6 transition-all"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6 flex-1 w-full">
                                        <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-rose-600/20 text-white">
                                            {res.tableNumber ? `T${res.tableNumber}` : res.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold truncate">{res.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${res.status === 'Confirmed' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                                                    res.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                                                        'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                    }`}>
                                                    {res.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold opacity-60 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5 text-rose-500">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {new Date(res.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ClockIcon className="w-4 h-4" />
                                                    {res.time}
                                                </div>
                                                <div className="flex items-center gap-1.5 border-l border-black/5 pl-4">
                                                    <UserGroupIcon className="w-4 h-4" />
                                                    {res.partySize} Guests
                                                </div>
                                                <div className="flex items-center gap-1.5 border-l border-black/5 pl-4 hidden sm:flex">
                                                    <PhoneIcon className="w-4 h-4" />
                                                    {res.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                     {(user.role === 'admin' || user.role === 'owner') && res.status === 'Pending' && (
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => handleStatusUpdate(res._id, 'Confirmed')}
                                                className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black text-[9px] uppercase tracking-widest shadow-xl shadow-emerald-600/20"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(res._id, 'Cancelled')}
                                                className="flex-1 md:flex-none px-6 py-3 theme-card-item border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Booking Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="theme-card rounded-[3rem] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-10 border-b border-black/5 flex justify-between items-center bg-rose-500/5 flex-shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Reserve Table</h2>
                                    <p className="text-xs text-rose-500 font-bold uppercase tracking-widest">{selectedRestaurant?.name}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 opacity-60 hover:opacity-100 theme-card-item rounded-xl transition">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                             <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto flex-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                <div className="space-y-5">
                                    <div>
                                        <div className="relative group">
                                            <UserGroupIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 transition-transform group-focus-within:scale-110" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Guest Name"
                                                className="w-full theme-card-item border border-black/5 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold placeholder:opacity-30"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="relative group">
                                            <PhoneIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 transition-transform group-focus-within:scale-110" />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="Phone Number"
                                                className="w-full theme-card-item border border-black/5 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold placeholder:opacity-30"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    {/* Modern Date Strip */}
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block">Select Date</label>
                                        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                            {Array.from({ length: 7 }).map((_, i) => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + i);
                                                const dateString = d.toISOString().split('T')[0];
                                                const isSelected = formData.date === dateString;
                                                const dayName = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
                                                const dayNum = d.getDate();
                                                return (
                                                    <button
                                                        key={dateString}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, date: dateString })}
                                                        className={`flex-shrink-0 snap-start w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                                                            isSelected ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105' : 'theme-card-item border border-black/5 hover:border-rose-500/30'
                                                        }`}
                                                    >
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'opacity-80' : 'opacity-40'}`}>{dayName}</span>
                                                        <span className="text-xl font-black mt-1">{dayNum}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Modern Time Chips */}
                                    {formData.date && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block">Select Time</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(time => {
                                                    const isSelected = formData.time === time;
                                                    const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                                                    return (
                                                        <button
                                                            key={time}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, time: time })}
                                                            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                                                                isSelected ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'theme-card-item border border-black/5 hover:border-purple-500/30'
                                                            }`}
                                                        >
                                                            {displayTime}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                    <div className="relative group">
                                        <UserGroupIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 transition-transform group-focus-within:scale-110" />
                                        <select
                                            className="w-full theme-card-item border border-black/5 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all appearance-none font-bold"
                                            value={formData.partySize}
                                            onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                <option key={n} value={n} className="theme-card-item text-black dark:text-white">
                                                    {n} Guest{n > 1 ? 's' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.date && formData.time && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 border-t border-black/5 pt-6">
                                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-4 block flex items-center justify-between">
                                                <span>Restaurant Floor Plan</span>
                                                <span className="flex gap-3">
                                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Available</span>
                                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Booked</span>
                                                </span>
                                            </label>
                                            
                                            <div className="relative w-full overflow-x-auto theme-card-item rounded-3xl border-2 border-dashed border-black/10 shadow-inner scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                                <div className="relative w-full min-w-[500px] aspect-[4/3] p-4 flex flex-col">
                                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/5 rounded-full text-[8px] font-black uppercase tracking-widest opacity-40">Entrance</div>
                                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/5 rounded-full text-[8px] font-black uppercase tracking-widest opacity-40">Kitchen</div>
                                                    
                                                    {/* Dynamic Floor Plan Layout */}
                                                    <div className="absolute inset-0 mt-8 mb-8 mx-4">
                                                        {selectedRestaurant?.tables?.map((table, idx) => {
                                                            let posX = table.x;
                                                            let posY = table.y;
                                                            if (posX === 0 && posY === 0) {
                                                                const cols = 5;
                                                                const spacing = 18;
                                                                const margin = 8;
                                                                posX = margin + (idx % cols) * spacing;
                                                                posY = margin + Math.floor(idx / cols) * spacing;
                                                            }

                                                            const isOccupied = occupiedTables.includes(table.number);
                                                            const isSelected = formData.tableNumber === table.number.toString();

                                                            return (
                                                                <button
                                                                    key={table.number}
                                                                    type="button"
                                                                    disabled={isOccupied}
                                                                    onClick={() => setFormData({ ...formData, tableNumber: table.number.toString() })}
                                                                    className={`absolute w-12 h-12 sm:w-16 sm:h-16 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 shadow-lg ${
                                                                        isOccupied ? 'bg-rose-500/20 border-2 border-rose-500/30 text-rose-500 cursor-not-allowed' :
                                                                        isSelected ? 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-emerald-500/40 scale-110 z-10' :
                                                                        'bg-white dark:bg-gray-800 border-2 border-black/10 hover:border-emerald-500 text-black dark:text-white hover:scale-105'
                                                                    }`}
                                                                    style={{ left: `${posX}%`, top: `${posY}%` }}
                                                                >
                                                                    <span className="text-[10px] sm:text-xs font-black">T{table.number}</span>
                                                                    <div className="flex -space-x-1">
                                                                        {[...Array(Math.min(table.capacity || 2, 4))].map((_, i) => (
                                                                            <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-black/10 ${isOccupied ? 'bg-current opacity-40' : isSelected ? 'bg-white' : 'bg-emerald-500/50'}`} />
                                                                        ))}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-6 bg-rose-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-rose-600/40 active:scale-95 transition-all"
                                >
                                    Confirm Booking
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reservations;
