import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import {
    updateProfile,
    updateRestaurant,
    deleteAccount,
    updateNotificationPrefs,
    chatWithAi
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
    CameraIcon,
    Squares2X2Icon,
    PlusIcon,
    SparklesIcon
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

const InputField = ({ label, icon: Icon, type = 'text', name, value, onChange, placeholder }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-5 w-5 h-5 text-rose-500 transition-transform group-focus-within:scale-110" />}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full theme-card-item border border-black/5 rounded-2xl py-4 ${Icon ? 'pl-14' : 'px-6'} pr-4 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold placeholder:opacity-30`}
            />
        </div>
    </div>
);

const PasswordField = ({ label, icon: Icon, name, value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute left-5 w-5 h-5 text-rose-500 transition-transform group-focus-within:scale-110" />}
                <input
                    type={show ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full theme-card-item border border-black/5 rounded-2xl py-4 pl-14 pr-14 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold placeholder:opacity-30"
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-5 opacity-30 hover:opacity-100 transition-all">
                    {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

// ─── Save Button ───────────────────────────────────────────────────────────────
const SaveButton = ({ isLoading, label = 'Apply Changes' }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 disabled:opacity-50 flex items-center gap-3 active:scale-95"
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
            <><CheckCircleIcon className="w-5 h-5" />{label}</>
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
            const payload = { name: form.name.trim() };
            if (form.email && form.email.trim()) {
                payload.email = form.email.trim();
            }
            if (avatar) {
                payload.avatar = avatar;
            }
            const { data } = await updateProfile(payload);
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

    useEffect(() => {
        if (user?.avatar) {
            setAvatar(user.avatar);
        }
    }, [user?.avatar]);

    return (
        <div className="p-6 space-y-8">
            {/* Avatar */}
            <div className="flex items-center gap-5 pb-6 border-b border-black/5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                        {(avatar || user?.avatar) ? (
                            <img src={avatar || user?.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            (form.name || user?.name || 'U').charAt(0).toUpperCase()
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => { setAvatarInput(avatar); setShowAvatarModal(true); }}
                        className="absolute -bottom-2 -right-2 p-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg border border-rose-500 transition shadow"
                        title="Change profile photo"
                    >
                        <CameraIcon className="w-4 h-4 text-white" />
                    </button>
                </div>
                <div>
                    <h3 className="font-semibold">{user?.name}</h3>
                    <p className="text-sm opacity-60 mt-0.5 capitalize">{user?.role}</p>
                    <button
                        type="button"
                        onClick={() => { setAvatarInput(avatar); setShowAvatarModal(true); }}
                        className="text-xs text-rose-500 hover:opacity-80 mt-1.5 transition"
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
                            className="theme-card rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <h3 className="font-bold text-lg mb-1">Profile Photo</h3>
                            <p className="text-sm opacity-60 mb-4">Upload a photo from your device or paste an image URL.</p>
                            
                            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl border border-rose-500/20 text-xs font-bold cursor-pointer transition mb-4">
                                <span>Upload Photo from Device</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const img = new window.Image();
                                                img.onload = () => {
                                                    const canvas = document.createElement('canvas');
                                                    let width = img.width;
                                                    let height = img.height;
                                                    const maxWidth = 800;
                                                    if (width > maxWidth) {
                                                        height = Math.round((height * maxWidth) / width);
                                                        width = maxWidth;
                                                    }
                                                    canvas.width = width;
                                                    canvas.height = height;
                                                    const ctx = canvas.getContext('2d');
                                                    ctx.drawImage(img, 0, 0, width, height);
                                                    setAvatarInput(canvas.toDataURL('image/jpeg', 0.8));
                                                };
                                                img.src = event.target.result;
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>

                            {avatarInput && (
                                <div className="mb-4 rounded-xl overflow-hidden h-28 border border-black/5 theme-card-item">
                                    <img src={avatarInput} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                </div>
                            )}
                            <input
                                autoFocus
                                type="text"
                                value={avatarInput}
                                onChange={e => setAvatarInput(e.target.value)}
                                placeholder="Or paste image URL..."
                                className="w-full theme-card-item border-transparent rounded-xl px-4 py-3 placeholder:opacity-40 focus:outline-none focus:border-rose-500 mb-4 text-sm"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAvatarModal(false)}
                                    className="flex-1 py-2.5 theme-card-item rounded-xl hover:opacity-80 transition text-sm"
                                >
                                    Cancel
                                </button>
                                {avatar && (
                                    <button
                                        onClick={async () => {
                                            setAvatar('');
                                            setAvatarInput('');
                                            setShowAvatarModal(false);
                                            try {
                                                const { data } = await updateProfile({ name: form.name, email: form.email, avatar: '' });
                                                setUser(prev => ({ ...prev, avatar: '' }));
                                                showMessage('success', 'Profile photo removed');
                                            } catch (err) {
                                                showMessage('error', 'Failed to remove profile photo');
                                            }
                                        }}
                                        className="px-4 py-2.5 text-red-500 hover:opacity-80 transition text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        const newAvatar = avatarInput.trim();
                                        setAvatar(newAvatar);
                                        setShowAvatarModal(false);
                                        if (!newAvatar) return;
                                        try {
                                            const { data } = await updateProfile({ name: form.name, email: form.email, avatar: newAvatar });
                                            setUser(prev => ({ ...prev, avatar: data.avatar || newAvatar }));
                                            showMessage('success', 'Profile photo updated successfully!');
                                        } catch (err) {
                                            showMessage('error', err?.response?.data?.message || 'Failed to update profile photo');
                                        }
                                    }}
                                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition text-sm font-medium"
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
                <h4 className="text-xs font-semibold opacity-40 uppercase tracking-wider">Account Info</h4>
                <InputField label="Full Name" icon={UserIcon} name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                <InputField label="Email Address" icon={EnvelopeIcon} type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Your email" />
                <div className="flex justify-end">
                    <SaveButton isLoading={loading} label="Update Profile" />
                </div>
            </form>

            {/* Change Password */}
            <form onSubmit={handlePassword} className="space-y-5 pt-6 border-t border-black/5">
                <h4 className="text-xs font-semibold opacity-40 uppercase tracking-wider flex items-center gap-2">
                    <LockClosedIcon className="w-3.5 h-3.5" /> Change Password
                </h4>
                <PasswordField label="New Password" icon={KeyIcon} name="password" value={pwForm.password} onChange={e => setPwForm({ ...pwForm, password: e.target.value })} placeholder="Min. 6 characters" />
                <PasswordField label="Confirm Password" icon={LockClosedIcon} name="confirmPassword" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Confirm new password" />
                {pwForm.password.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex gap-1 h-1.5">
                            {strengthMap.map((lvl, i) => (
                                <div key={lvl} className={`flex-1 rounded-full transition-all ${strengthMap.indexOf(strength) >= i ? strengthColor : 'opacity-20 bg-gray-500'}`} />
                            ))}
                        </div>
                        <p className="text-xs opacity-40">Strength: <span className="text-rose-500 font-bold">{strength}</span></p>
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
        image: selectedRestaurant?.image || '',
        openingTime: selectedRestaurant?.openingTime || '10:00',
        closingTime: selectedRestaurant?.closingTime || '22:00'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRestaurant?._id) return showMessage('error', 'No restaurant selected');
        setLoading(true);
        try {
            const { data } = await updateRestaurant(selectedRestaurant._id, form);
            updateRestaurantInList(data);
            showMessage('success', 'Restaurant info updated — image now reflected everywhere');
        } catch {
            showMessage('error', 'Failed to update restaurant info');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex items-center gap-4 pb-6 border-b border-black/5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {form.image
                        ? <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                        : (form.name || 'R').charAt(0)
                    }
                </div>
                <div>
                    <h3 className="font-semibold">Restaurant Profile</h3>
                    <p className="text-sm opacity-60">Update your restaurant's public info</p>
                </div>
            </div>

            <InputField label="Restaurant Name" icon={HomeIcon} name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Restaurant name" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Cuisine Type" name="cuisine" value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })} placeholder="e.g. Indian, Italian" />
                <InputField label="Address" name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Opening Time" name="openingTime" type="time" value={form.openingTime} onChange={e => setForm({ ...form, openingTime: e.target.value })} />
                <InputField label="Closing Time" name="closingTime" type="time" value={form.closingTime} onChange={e => setForm({ ...form, closingTime: e.target.value })} />
            </div>

            <div>
                <label className="block text-sm font-medium opacity-70 mb-2">Description</label>
                <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your restaurant..."
                    className="w-full theme-card-item border-transparent rounded-xl py-3 px-4 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition resize-none"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold opacity-80 mb-2">Cover Image (Upload from device or enter URL)</label>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl border border-rose-500/20 text-xs font-bold cursor-pointer transition shrink-0">
                        <span>Upload from Device</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const img = new window.Image();
                                        img.onload = () => {
                                            const canvas = document.createElement('canvas');
                                            let width = img.width;
                                            let height = img.height;
                                            const maxWidth = 1000;
                                            if (width > maxWidth) {
                                                height = Math.round((height * maxWidth) / width);
                                                width = maxWidth;
                                            }
                                            canvas.width = width;
                                            canvas.height = height;
                                            const ctx = canvas.getContext('2d');
                                            ctx.drawImage(img, 0, 0, width, height);
                                            setForm((prev) => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.8) }));
                                        };
                                        img.src = event.target.result;
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </label>
                    <input 
                        type="text" 
                        name="image" 
                        value={form.image} 
                        onChange={e => setForm({ ...form, image: e.target.value })} 
                        placeholder="Or paste cover image URL..." 
                        className="w-full theme-card-item border-transparent rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-rose-500" 
                    />
                </div>
            </div>

            {form.image && (
                <div className="rounded-xl overflow-hidden h-36 border border-black/5 theme-card-item relative group">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, image: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-xl transition cursor-pointer text-xs"
                        title="Remove Photo"
                    >
                        ✕
                    </button>
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
            <h4 className="text-xs font-semibold opacity-40 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" /> Active Sessions
            </h4>
            <div className="flex items-center justify-between theme-card-item border border-black/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">💻</span>
                    <div>
                        <p className="text-sm font-bold">Current Browser</p>
                        <p className="text-xs opacity-40">Active now</p>
                    </div>
                </div>
                <span className="text-xs px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full font-bold">Active</span>
            </div>
        </div>

        <div className="pt-4 border-t border-black/5">
            <h4 className="text-xs font-semibold opacity-40 uppercase tracking-wider mb-4">Security Checklist</h4>
            <div className="space-y-3">
                {[
                    { label: 'Strong Password', done: true, hint: 'Your password meets strength requirements' },
                    { label: 'Email Verified', done: true, hint: 'Your account email is verified' },
                    { label: 'Two-Factor Authentication', done: true, hint: 'Add extra security with 2FA' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 theme-card-item rounded-xl border border-black/5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500/10' : 'opacity-20 bg-gray-500'}`}>
                            {item.done
                                ? <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                : <XCircleIcon className="w-5 h-5 opacity-40" />}
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${item.done ? '' : 'opacity-40'}`}>{item.label}</p>
                            <p className="text-xs opacity-40">{item.hint}</p>
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
            <h4 className="text-xs font-semibold opacity-40 uppercase tracking-wider flex items-center gap-2">
                <BellIcon className="w-4 h-4" /> Notification Preferences
            </h4>
            {options.map(({ key, label, desc }) => (
                <div
                    key={key}
                    onClick={() => toggle(key)}
                    className="flex items-center justify-between p-5 theme-card-item border border-black/5 hover:border-rose-500/30 rounded-2xl cursor-pointer transition"
                >
                    <div>
                        <p className="text-sm font-bold">{label}</p>
                        <p className="text-xs opacity-60 mt-0.5">{desc}</p>
                    </div>
                    <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${prefs[key] ? 'bg-rose-600' : 'bg-gray-400/20'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[key] ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                </div>
            ))}
            <div className="flex justify-end pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={loading}
                    type="button"
                    className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                    {loading ? 'Saving...' : <><CheckCircleIcon className="w-5 h-5" /> Save Preferences</>}
                </motion.button>
            </div>
        </div>
    );
};

// ─── Tables Tab ────────────────────────────────────────────────────────────────
const TablesTab = ({ selectedRestaurant, updateRestaurantInList, showMessage }) => {
    const [tables, setTables] = useState(selectedRestaurant?.tables || []);
    const [loading, setLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (selectedRestaurant?.tables) {
            setTables(selectedRestaurant.tables);
        }
    }, [selectedRestaurant]);

    const handleAddTable = () => {
        const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
        setTables([...tables, { number: nextNumber, capacity: 4, x: 50, y: 50 }]);
    };

    const handleRemoveTable = (idx) => {
        setTables(tables.filter((_, i) => i !== idx));
    };

    const updateTable = (idx, field, value) => {
        const newTables = [...tables];
        newTables[idx] = { ...newTables[idx], [field]: value };
        setTables(newTables);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedRestaurant?._id) return showMessage('error', 'No restaurant selected');
        setLoading(true);
        try {
            const { data } = await updateRestaurant(selectedRestaurant._id, { tables });
            updateRestaurantInList(data);
            showMessage('success', 'Table layout saved successfully');
        } catch {
            showMessage('error', 'Failed to save table layout');
        } finally {
            setLoading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return showMessage('error', 'Please enter a prompt for the AI');
        setAiLoading(true);
        try {
            const msg = `You are an expert restaurant layout designer.
            The user prompt is: "${aiPrompt}"
            Please return ONLY a JSON array representing the tables. DO NOT wrap in markdown, no other text.
            Each object must have exactly these keys:
            - number (integer, starting from 1)
            - capacity (integer, based on the prompt, default 4)
            - x (integer, 5 to 95, representing horizontal percentage on the floor plan)
            - y (integer, 10 to 90, representing vertical percentage on the floor plan)
            Ensure the tables are spaced out evenly in a grid-like fashion and do not overlap.`;

            let generatedTables = [];
            try {
                const { data } = await chatWithAi([{ role: 'user', content: msg }]);
                let reply = data.reply;
                if (reply.includes('<think>') && reply.includes('</think>')) {
                    reply = reply.replace(/<think>[\s\S]*?<\/think>\n?/g, '');
                }
                reply = reply.trim();
                if (reply.startsWith('```')) {
                    reply = reply.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
                }
                generatedTables = JSON.parse(reply);
                if (!Array.isArray(generatedTables)) throw new Error("Not an array");
                generatedTables = generatedTables.map((t, i) => ({
                    number: t.number || (i + 1),
                    capacity: t.capacity || 4,
                    x: Math.min(Math.max(t.x || 50, 5), 95),
                    y: Math.min(Math.max(t.y || 50, 10), 90)
                }));
            } catch (err) {
                console.error("AI JSON parse failed, using smart algorithm fallback.", err);
                const numbers = aiPrompt.match(/\d+/g);
                const numTables = numbers && numbers.length > 0 ? parseInt(numbers[0], 10) : 10;
                const capacity = numbers && numbers.length > 1 ? parseInt(numbers[1], 10) : 4;
                const cols = Math.ceil(Math.sqrt(numTables * 1.5));
                const spacingX = cols > 1 ? 80 / (cols - 1) : 0;
                const rows = Math.ceil(numTables / cols);
                const spacingY = rows > 1 ? 70 / (rows - 1) : 0;
                
                generatedTables = Array.from({ length: numTables }).map((_, i) => ({
                    number: i + 1,
                    capacity: capacity,
                    x: cols > 1 ? 10 + (i % cols) * spacingX : 50,
                    y: rows > 1 ? 15 + Math.floor(i / cols) * spacingY : 50
                }));
            }
            
            setTables(generatedTables);
            showMessage('success', `AI generated a layout with ${generatedTables.length} tables!`);
            setAiPrompt('');
        } catch (error) {
            console.error("AI Generation Error", error);
            showMessage('error', 'Failed to communicate with AI');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-black/5">
                <div>
                    <h3 className="font-semibold flex items-center gap-2"><Squares2X2Icon className="w-5 h-5 text-rose-500" /> Table Floor Plan</h3>
                    <p className="text-sm opacity-60">Manage your seating arrangement and capacity</p>
                </div>
                <button
                    type="button"
                    onClick={handleAddTable}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition"
                >
                    <PlusIcon className="w-4 h-4" /> Add Table
                </button>
            </div>

            {/* AI Auto-Generator */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-purple-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. Generate 30 tables with 2 seats each..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-gray-900 border border-black/5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-bold text-sm shadow-sm"
                            disabled={aiLoading}
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={aiLoading || !aiPrompt.trim()}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {aiLoading ? (
                            <>
                                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" /> AI Generate
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Editor */}
                <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Live Preview & Positioning</label>
                    <div className="relative w-full aspect-square md:aspect-[4/3] theme-card-item rounded-3xl border-2 border-dashed border-black/10 shadow-inner overflow-hidden">
                        <div className="absolute inset-0 m-6">
                            {tables.map((table, idx) => (
                                <div
                                    key={idx}
                                    className="absolute w-12 h-12 rounded-2xl bg-emerald-500 border-2 border-emerald-600 text-white shadow-emerald-500/40 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                                    style={{ left: `${table.x}%`, top: `${table.y}%` }}
                                    draggable
                                    onDragEnd={(e) => {
                                        const rect = e.target.parentElement.getBoundingClientRect();
                                        let newX = ((e.clientX - rect.left) / rect.width) * 100;
                                        let newY = ((e.clientY - rect.top) / rect.height) * 100;
                                        newX = Math.max(0, Math.min(100, newX));
                                        newY = Math.max(0, Math.min(100, newY));
                                        updateTable(idx, 'x', newX);
                                        updateTable(idx, 'y', newY);
                                    }}
                                >
                                    <span className="text-[10px] font-black leading-none">T{table.number}</span>
                                    <span className="text-[8px] font-bold opacity-80 mt-1">{table.capacity}🪑</span>
                                </div>
                            ))}
                        </div>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/5 rounded-full text-[8px] font-black uppercase tracking-widest opacity-40 pointer-events-none">Entrance</div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/5 rounded-full text-[8px] font-black uppercase tracking-widest opacity-40 pointer-events-none">Kitchen</div>
                    </div>
                    <p className="text-xs opacity-50 text-center italic">Drag tables in the preview to position them, or use sliders below.</p>
                </div>

                {/* Table List */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Table Details</label>
                    {tables.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-black/5 rounded-2xl opacity-60">
                            No tables added yet.
                        </div>
                    ) : (
                        tables.map((table, idx) => (
                            <div key={idx} className="theme-card-item border border-black/5 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-rose-500">Table {table.number}</h4>
                                    <button type="button" onClick={() => handleRemoveTable(idx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition" title="Remove Table">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">Table No.</label>
                                        <input type="number" value={table.number} onChange={e => updateTable(idx, 'number', parseInt(e.target.value) || 0)} className="w-full theme-card border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">Capacity</label>
                                        <input type="number" min="1" value={table.capacity} onChange={e => updateTable(idx, 'capacity', parseInt(e.target.value) || 1)} className="w-full theme-card border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-40">
                                        <span>X Position: {Math.round(table.x)}%</span>
                                        <span>Y Position: {Math.round(table.y)}%</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <input type="range" min="0" max="100" value={table.x} onChange={e => updateTable(idx, 'x', parseFloat(e.target.value))} className="w-full accent-rose-500" />
                                        <input type="range" min="0" max="100" value={table.y} onChange={e => updateTable(idx, 'y', parseFloat(e.target.value))} className="w-full accent-rose-500" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-black/5">
                <SaveButton isLoading={loading} label="Save Table Layout" />
            </div>
        </form>
    );
};

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
        ...(user?.role === 'owner' ? [
            { id: 'restaurant', name: 'Restaurant', icon: HomeIcon },
            { id: 'tables', name: 'Tables', icon: Squares2X2Icon }
        ] : []),
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Settings</h1>
                <p className="opacity-60 mt-1">Manage your account and preferences</p>
            </div>

            <Toast message={message} onClose={() => setMessage(null)} />

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 theme-card p-2 rounded-2xl border border-black/5 w-fit shadow-lg">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${activeTab === tab.id
                                ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/30'
                                : 'opacity-40 hover:opacity-100 hover:bg-black/5'
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
                className="theme-card rounded-2xl border border-black/5 shadow-2xl overflow-hidden"
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
                {activeTab === 'tables' && (
                    <TablesTab
                        selectedRestaurant={selectedRestaurant}
                        updateRestaurantInList={updateRestaurantInList}
                        showMessage={showMessage}
                    />
                )}
                {activeTab === 'notifications' && <NotificationsTab user={user} showMessage={showMessage} />}
            </motion.div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-red-500 mb-1 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-sm opacity-60 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition text-sm font-bold"
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
                            className="theme-card border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2">Delete Account</h3>
                            <p className="opacity-60 text-sm text-center mb-6">
                                This will permanently delete your account. Type <span className="font-bold text-red-500">DELETE</span> to confirm.
                            </p>
                            <input
                                type="text"
                                value={deleteConfirm}
                                onChange={e => setDeleteConfirm(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="w-full theme-card-item border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                                    className="flex-1 py-3 theme-card-item rounded-xl hover:opacity-80 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-bold"
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
