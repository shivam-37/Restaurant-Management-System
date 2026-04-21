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
                className="relative w-12 h-12 flex items-center justify-center theme-card-item border border-black/5 rounded-2xl hover:border-amber-500/30 transition-all shadow-sm group"
            >
                <BellIcon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-600 rounded-full border-2 border-[var(--bg-primary)] shadow-lg shadow-amber-600/40"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-96 theme-card border border-black/5 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-8 border-b border-black/5 flex justify-between items-center bg-black/[0.02]">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Notification Matrix</h3>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">{unreadCount} Unread Pulsations</p>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                    <XMarkIcon className="w-5 h-5 opacity-40 hover:opacity-100" />
                                </button>
                            </div>

                            <div className="max-h-[32rem] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-16 text-center opacity-20">
                                        <BellIcon className="w-12 h-12 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Signal Void</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-black/5">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif._id}
                                                className={`p-6 hover:bg-black/[0.02] transition-colors flex gap-4 ${!notif.isRead ? 'bg-amber-600/[0.03]' : 'opacity-60'}`}
                                            >
                                                <div className="mt-1">
                                                    {notif.type === 'Order' ? (
                                                        <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircleIcon className="w-4 h-4 text-emerald-500" /></div>
                                                    ) : notif.type === 'Reservation' ? (
                                                        <div className="p-2 bg-amber-500/10 rounded-lg"><InformationCircleIcon className="w-4 h-4 text-amber-500" /></div>
                                                    ) : (
                                                        <div className="p-2 bg-amber-500/10 rounded-lg"><ExclamationCircleIcon className="w-4 h-4 text-amber-500" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[11px] font-black leading-relaxed uppercase tracking-widest ${!notif.isRead ? '' : ''}`}>
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">
                                                            T-MINUS: {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        {!notif.isRead && (
                                                            <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={() => handleMarkRead(notif._id)}
                                                        className="h-2 w-2 bg-amber-600 rounded-full mt-3 flex-shrink-0 animate-pulse shadow-lg shadow-amber-600/40"
                                                        title="Acknowledge Signal"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="p-6 bg-black/[0.02] border-t border-black/5 text-center">
                                    <button className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">Clear All Signals</button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationTray;
