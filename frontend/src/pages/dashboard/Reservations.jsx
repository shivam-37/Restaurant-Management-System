import { useState, useEffect, useContext } from 'react';
import { getReservations, createReservation, updateReservationStatus, getMyReservations } from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { PlusIcon, CalendarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

const Reservations = () => {
    const { user, selectedRestaurant } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
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
        try {
            // If admin, get all. If user, get my.
            const { data } = user.role === 'admin'
                ? await getReservations(selectedRestaurant?._id)
                : await getMyReservations(selectedRestaurant?._id);
            setReservations(data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Reservations</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Book Table
                </button>
            </div>

            <div className="space-y-4">
                {reservations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Reservations Found</h3>
                        <p className="text-gray-500">Book a table to get started.</p>
                    </div>
                ) : (
                    reservations.map((res) => (
                        <div key={res._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-6">
                                <div className="text-center bg-indigo-50 px-4 py-2 rounded-lg">
                                    <p className="text-xs text-indigo-600 font-bold uppercase">{new Date(res.date).toLocaleString('default', { month: 'short' })}</p>
                                    <p className="text-xl font-bold text-gray-900">{new Date(res.date).getDate()}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{res.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {res.time}</span>
                                        <span className="flex items-center gap-1"><UserGroupIcon className="h-4 w-4" /> {res.partySize} Guests</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{res.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px - 3 py - 1 rounded - full text - xs font - semibold ${res.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                        res.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    } `}>
                                    {res.status}
                                </span>

                                {user.role === 'admin' && res.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(res._id, 'Confirmed')}
                                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(res._id, 'Cancelled')}
                                            className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Book a Table</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.partySize}
                                    onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <option key={n} value={n}>{n} People</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reservations;
