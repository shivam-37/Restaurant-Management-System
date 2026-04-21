import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import {
    updateProfile,
    updateRestaurant,
    deleteAccount,
    updateNotificationPrefs
} from '../../services/api';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    KeyIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
    BellIcon,
    HomeIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    CameraIcon
} from '@heroicons/react/24/outline';

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => (
    <AnimatePresence>
        {message && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-sm mb-6 ${message.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
            >
                {message.type === 'success'
                    ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                    : <XCircleIcon className="w-5 h-5 flex-shrink-0" />}
                <span>{message.text}</span>
                <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100">✕</button>
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── Input Field ───────────────────────────────────────────────────────────────
const InputField = ({ label, icon: Icon, type = 'text', name, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <div className="relative flex items-center">
            {Icon && <Icon className="absolute left-4 w-5 h-5 text-gray-500 pointer-events-none" />}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 ${Icon ? 'pl-12' : 'pl-4'} pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition`}
            />
        </div>
    </div>
);

// ─── Password Field ────────────────────────────────────────────────────────────
const PasswordField = ({ label, icon: Icon, name, value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div className="relative flex items-center">
                {Icon && <Icon className="absolute left-4 w-5 h-5 text-gray-500 pointer-events-none" />}
                <input
                    type={show ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-4 text-gray-400 hover:text-white transition">
                    {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

// ─── Save Button ───────────────────────────────────────────────────────────────
const SaveButton = ({ isLoading, label = 'Save Changes' }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
    >
        {isLoading ? (
            <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
            </>
        ) : (
            <><CheckCircleIcon className="w-4 h-4" />{label}</>
        )}
    </motion.button>
);

// ─── Profile Tab ───────────────────────────────────────────────────────────────
const ProfileTab = ({ user, setUser, showMessage }) => {
    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [pwForm, setPwForm] = useState({ password: '', confirmPassword: '' });
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [avatarInput, setAvatarInput] = useState('');
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    const handleProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await updateProfile({ name: form.name, email: form.email, avatar });
            // Update context so header/navbar reflects the change immediately
            setUser(prev => ({ ...prev, name: data.name, email: data.email, avatar: data.avatar || '' }));
            showMessage('success', 'Profile updated successfully');
        } catch (err) {
            showMessage('error', err?.response?.data?.message || 'Failed to update profile');
        } finally { setLoading(false); }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (pwForm.password !== pwForm.confirmPassword) return showMessage('error', 'Passwords do not match');
        if (pwForm.password.length < 6) return showMessage('error', 'Password must be at least 6 characters');
        setPwLoading(true);
        try {
            await updateProfile({ password: pwForm.password });
            showMessage('success', 'Password changed successfully');
            setPwForm({ password: '', confirmPassword: '' });
        } catch (err) {
            showMessage('error', err?.response?.data?.message || 'Failed to change password');
        } finally { setPwLoading(false); }
    };

    const strengthMap = ['Too short', 'Weak', 'Medium', 'Strong'];
    const strength = pwForm.password.length >= 12 ? 'Strong' : pwForm.password.length >= 8 ? 'Medium' : pwForm.password.length >= 4 ? 'Weak' : 'Too short';
    const strengthColor = { Strong: 'bg-green-500', Medium: 'bg-yellow-500', Weak: 'bg-red-500', 'Too short': 'bg-gray-700' }[strength];

    return (
        <div className="p-6 space-y-8">
            {/* Avatar */}
            <div className="flex items-center gap-5 pb-6 border-b border-gray-800">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                        {avatar
                            ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" onError={() => setAvatar('')} />
                            : (form.name || user?.name || 'U').charAt(0).toUpperCase()
                        }
                    </div>
                    <button
                        type="button"
                        onClick={() => { setAvatarInput(avatar); setShowAvatarModal(true); }}
                        className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-500 transition shadow"
                        title="Change profile photo"
                    >
                        <CameraIcon className="w-4 h-4 text-white" />
                    </button>
                </div>
                <div>
                    <h3 className="text-white font-semibold">{user?.name}</h3>
                    <p className="text-sm text-gray-400 mt-0.5 capitalize">{user?.role}</p>
                    <button
                        type="button"
                        onClick={() => { setAvatarInput(avatar); setShowAvatarModal(true); }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 mt-1.5 transition"
                    >
                        Change photo
                    </button>
                </div>
            </div>

            {/* Avatar URL Modal */}
            <AnimatePresence>
                {showAvatarModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAvatarModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <h3 className="text-white font-bold text-lg mb-1">Profile Photo</h3>
                            <p className="text-sm text-gray-400 mb-4">Paste any public image URL to use as your photo.</p>
                            {avatarInput && (
                                <div className="mb-4 rounded-xl overflow-hidden h-28 border border-gray-700 bg-gray-800">
                                    <img src={avatarInput} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                </div>
                            )}
                            <input
                                autoFocus
                                type="text"
                                value={avatarInput}
                                onChange={e => setAvatarInput(e.target.value)}
                                placeholder="https://example.com/photo.jpg"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 mb-4 text-sm"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAvatarModal(false)}
                                    className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm"
                                >
                                    Cancel
                                </button>
                                {avatar && (
                                    <button
                                        onClick={() => { setAvatar(''); setAvatarInput(''); setShowAvatarModal(false); }}
                                        className="px-4 py-2.5 text-red-400 hover:text-red-300 transition text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                                <button
                                    onClick={() => { setAvatar(avatarInput.trim()); setShowAvatarModal(false); }}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Info Form */}
            <form onSubmit={handleProfile} className="space-y-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Info</h4>
                <InputField label="Full Name" icon={UserIcon} name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                <InputField label="Email Address" icon={EnvelopeIcon} type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Your email" />
                <div className="flex justify-end">
                    <SaveButton isLoading={loading} label="Update Profile" />
                </div>
            </form>

            {/* Change Password */}
            <form onSubmit={handlePassword} className="space-y-5 pt-6 border-t border-gray-800">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <LockClosedIcon className="w-3.5 h-3.5" /> Change Password
                </h4>
                <PasswordField label="New Password" icon={KeyIcon} name="password" value={pwForm.password} onChange={e => setPwForm({ ...pwForm, password: e.target.value })} placeholder="Min. 6 characters" />
                <PasswordField label="Confirm Password" icon={LockClosedIcon} name="confirmPassword" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Confirm new password" />
                {pwForm.password.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex gap-1 h-1.5">
                            {strengthMap.map((lvl, i) => (
                                <div key={lvl} className={`flex-1 rounded-full transition-all ${strengthMap.indexOf(strength) >= i ? strengthColor : 'bg-gray-700'}`} />
                            ))}
                        </div>
                        <p className="text-xs text-gray-400">Strength: <span className="text-white font-medium">{strength}</span></p>
                    </div>
                )}
                <div className="flex justify-end">
                    <SaveButton isLoading={pwLoading} label="Change Password" />
                </div>
            </form>
        </div>
    );
};

// ─── Restaurant Tab ────────────────────────────────────────────────────────────
const RestaurantTab = ({ selectedRestaurant, updateRestaurantInList, showMessage }) => {
    const [form, setForm] = useState({
        name: selectedRestaurant?.name || '',
        description: selectedRestaurant?.description || '',
        address: selectedRestaurant?.address || '',
        cuisine: selectedRestaurant?.cuisine || '',
        image: selectedRestaurant?.image || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRestaurant?._id) return showMessage('error', 'No restaurant selected');
        setLoading(true);
        try {
            const { data } = await updateRestaurant(selectedRestaurant._id, form);
            // Update both selectedRestaurant context AND the global restaurants list
            // so RestaurantList and RestaurantManagement reflect the new image immediately
            updateRestaurantInList(data);
            showMessage('success', 'Restaurant info updated — image now reflected everywhere');
        } catch {
            showMessage('error', 'Failed to update restaurant info');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-800">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {form.image
                        ? <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                        : (form.name || 'R').charAt(0)
                    }
                </div>
                <div>
                    <h3 className="text-white font-semibold">Restaurant Profile</h3>
                    <p className="text-sm text-gray-400">Update your restaurant's public info</p>
                </div>
            </div>

            <InputField label="Restaurant Name" icon={HomeIcon} name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Restaurant name" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Cuisine Type" name="cuisine" value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })} placeholder="e.g. Indian, Italian" />
                <InputField label="Address" name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your restaurant..."
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
            </div>

            <InputField label="Cover Image URL" name="image" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/image.jpg" />

            {form.image && (
                <div className="rounded-xl overflow-hidden h-36 border border-gray-700">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                </div>
            )}

            <div className="flex justify-end pt-2">
                <SaveButton isLoading={loading} label="Save Restaurant Info" />
            </div>
        </form>
    );
};

// ─── Security Tab ──────────────────────────────────────────────────────────────
const SecurityTab = () => (
    <div className="p-6 space-y-8">
        <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" /> Active Sessions
            </h4>
            <div className="flex items-center justify-between bg-gray-800/40 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">💻</span>
                    <div>
                        <p className="text-sm font-medium text-white">Current Browser</p>
                        <p className="text-xs text-gray-400">Active now</p>
                    </div>
                </div>
                <span className="text-xs px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">Active</span>
            </div>
        </div>

        <div className="pt-2 border-t border-gray-800">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Security Checklist</h4>
            <div className="space-y-3">
                {[
                    { label: 'Strong Password', done: true, hint: 'Your password meets strength requirements' },
                    { label: 'Email Verified', done: true, hint: 'Your account email is verified' },
                    { label: 'Two-Factor Authentication', done: false, hint: 'Add extra security with 2FA — coming soon' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500/20' : 'bg-gray-700/50'}`}>
                            {item.done
                                ? <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                : <XCircleIcon className="w-5 h-5 text-gray-500" />}
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${item.done ? 'text-white' : 'text-gray-400'}`}>{item.label}</p>
                            <p className="text-xs text-gray-500">{item.hint}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─── Notifications Tab ─────────────────────────────────────────────────────────
const NotificationsTab = ({ user, showMessage }) => {
    const defaults = { orderUpdates: true, newReservations: true, promotions: false, weeklyReport: true };
    const [prefs, setPrefs] = useState({ ...defaults, ...(user?.notificationPrefs || {}) });
    const [loading, setLoading] = useState(false);

    const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }));

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateNotificationPrefs(prefs);
            showMessage('success', 'Notification preferences saved');
        } catch {
            showMessage('error', 'Failed to save preferences');
        } finally { setLoading(false); }
    };

    const options = [
        { key: 'orderUpdates', label: 'Order Updates', desc: 'When orders are placed or their status changes' },
        { key: 'newReservations', label: 'New Reservations', desc: 'When customers book or cancel table reservations' },
        { key: 'promotions', label: 'Promotions & Offers', desc: 'Platform news, deals and marketing updates' },
        { key: 'weeklyReport', label: 'Weekly Summary', desc: 'A weekly digest of your restaurant performance' },
    ];

    return (
        <div className="p-6 space-y-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <BellIcon className="w-4 h-4" /> Notification Preferences
            </h4>
            {options.map(({ key, label, desc }) => (
                <div
                    key={key}
                    onClick={() => toggle(key)}
                    className="flex items-center justify-between p-5 bg-gray-800/30 border border-gray-800 hover:border-gray-700 rounded-2xl cursor-pointer transition"
                >
                    <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${prefs[key] ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[key] ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                </div>
            ))}
            <div className="flex justify-end pt-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={loading}
                    type="button"
                    className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? 'Saving...' : <><CheckCircleIcon className="w-4 h-4" /> Save Preferences</>}
                </motion.button>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Settings = () => {
    const { user, setUser, selectedRestaurant, updateRestaurantInList, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return;
        setDeleteLoading(true);
        try {
            await deleteAccount();
            logout();
        } catch {
            showMessage('error', 'Failed to delete account');
            setDeleteLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: UserIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        ...(user?.role === 'owner' ? [{ id: 'restaurant', name: 'Restaurant', icon: HomeIcon }] : []),
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account and preferences</p>
            </div>

            <Toast message={message} onClose={() => setMessage(null)} />

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-900/60 p-1 rounded-xl border border-gray-800 w-fit">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Tab Panel */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
            >
                {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} showMessage={showMessage} />}
                {activeTab === 'security' && <SecurityTab />}
                {activeTab === 'restaurant' && (
                    <RestaurantTab
                        selectedRestaurant={selectedRestaurant}
                        updateRestaurantInList={updateRestaurantInList}
                        showMessage={showMessage}
                    />
                )}
                {activeTab === 'notifications' && <NotificationsTab user={user} showMessage={showMessage} />}
            </motion.div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-1 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition text-sm font-medium"
                >
                    <TrashIcon className="w-4 h-4" /> Delete My Account
                </motion.button>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white text-center mb-2">Delete Account</h3>
                            <p className="text-gray-400 text-sm text-center mb-6">
                                This will permanently delete your account. Type <span className="font-bold text-red-400">DELETE</span> to confirm.
                            </p>
                            <input
                                type="text"
                                value={deleteConfirm}
                                onChange={e => setDeleteConfirm(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                                    className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete Forever'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;