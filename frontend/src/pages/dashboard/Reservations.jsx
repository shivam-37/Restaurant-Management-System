import { useState, useEffect, useContext } from 'react';
import { getReservations, createReservation, updateReservationStatus, getMyReservations } from '../../services/api';
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
        partySize: 2
    });

    useEffect(() => {
        fetchReservations();
    }, [selectedRestaurant?._id, user?.role]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const { data } = (user.role === 'admin' || user.role === 'staff' || user.role === 'owner')
                ? await getReservations(selectedRestaurant?._id)
                : await getMyReservations(selectedRestaurant?._id);
            setReservations(data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRestaurant) {
            alert('Please select a restaurant first');
            return;
        }
        try {
            await createReservation({ ...formData, restaurantId: selectedRestaurant._id });
            fetchReservations();
            setIsModalOpen(false);
            setFormData({ ...formData, date: '', time: '' });
        } catch (error) {
            alert('Failed to book reservation');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateReservationStatus(id, status);
            fetchReservations();
        } catch (error) {
            alert('Failed to update status');
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                        {(user.role === 'admin' || user.role === 'staff' || user.role === 'owner') ? 'Reservations Desk' : 'My Bookings'}
                    </h1>
                    <p className="text-gray-400 font-medium">
                        {(user.role === 'admin' || user.role === 'staff' || user.role === 'owner')
                            ? `Incoming reservations for ${selectedRestaurant?.name || 'All Locations'}`
                            : `Your upcoming visits to ${selectedRestaurant?.name || 'our restaurants'}`}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition group"
                >
                    <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Book A Table
                </motion.button>
            </motion.div>

            {/* List Section */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : reservations.length === 0 ? (
                <motion.div
                    {...fadeInUp}
                    className="bg-gray-900/40 border-2 border-dashed border-gray-800 rounded-3xl p-16 text-center"
                >
                    <CalendarIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Reservations Found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mb-8">It looks like there are no bookings scheduled here yet.</p>
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
                                className="group bg-gray-900/40 border border-gray-800 hover:border-indigo-500/30 rounded-3xl p-6 transition-all backdrop-blur-xl"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6 flex-1 w-full">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-600/20">
                                            {res.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-white truncate">{res.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${res.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                                                    res.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                    {res.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5 text-indigo-400">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {new Date(res.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ClockIcon className="w-4 h-4" />
                                                    {res.time}
                                                </div>
                                                <div className="flex items-center gap-1.5 border-l border-gray-800 pl-4">
                                                    <UserGroupIcon className="w-4 h-4" />
                                                    {res.partySize} Guests
                                                </div>
                                                <div className="flex items-center gap-1.5 border-l border-gray-800 pl-4 hidden sm:flex">
                                                    <PhoneIcon className="w-4 h-4" />
                                                    {res.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {(user.role === 'admin' || user.role === 'staff' || user.role === 'owner') && res.status === 'Pending' && (
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => handleStatusUpdate(res._id, 'Confirmed')}
                                                className="flex-1 md:flex-none px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl hover:bg-green-500 hover:text-white transition font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(res._id, 'Cancelled')}
                                                className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                Decline
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
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-gray-900 border border-gray-800 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl shadow-indigo-500/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-indigo-600/10 to-transparent">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Reserve Table</h2>
                                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">{selectedRestaurant?.name}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 invisible h-0">Guest Name</label>
                                        <div className="relative">
                                            <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Guest Name"
                                                className="w-full bg-black/40 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="Phone Number"
                                                className="w-full bg-black/40 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-black/40 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition [color-scheme:dark]"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                                            <input
                                                type="time"
                                                required
                                                className="w-full bg-black/40 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition [color-scheme:dark]"
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <select
                                            className="w-full bg-black/40 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                                            value={formData.partySize}
                                            onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                <option key={n} value={n} className="bg-gray-900">{n} People</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition"
                                >
                                    Confirm Reservation
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
