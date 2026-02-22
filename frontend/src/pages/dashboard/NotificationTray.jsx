import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markNotificationRead } from '../../services/api';
import {
    BellIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const NotificationTray = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark notification as read");
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 transition"
            >
                <BellIcon className="w-5 h-5 text-gray-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-black animate-pulse"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                                <h3 className="font-bold text-white">Notifications</h3>
                                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <BellIcon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors flex gap-3 ${!notif.isRead ? 'bg-indigo-500/5' : ''}`}
                                        >
                                            <div className="mt-1">
                                                {notif.type === 'Order' ? (
                                                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                                ) : notif.type === 'Reservation' ? (
                                                    <InformationCircleIcon className="w-5 h-5 text-indigo-400" />
                                                ) : (
                                                    <ExclamationCircleIcon className="w-5 h-5 text-amber-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-1">
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => handleMarkRead(notif._id)}
                                                    className="w-2 h-2 bg-indigo-500 rounded-full mt-2 self-start ring-4 ring-indigo-500/20"
                                                ></button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationTray;
