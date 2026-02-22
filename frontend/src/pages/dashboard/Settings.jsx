import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import { updateProfile } from '../../services/api';
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
    PaintBrushIcon,
    CameraIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setIsLoading(false);
            return;
        }

        try {
            await updateProfile({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setFormData({ ...formData, password: '', confirmPassword: '' });
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: UserIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'preferences', name: 'Preferences', icon: PaintBrushIcon }
    ];

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account settings and preferences</p>
            </motion.div>

            {/* Settings Tabs */}
            <motion.div 
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="flex space-x-1 bg-gradient-to-br from-gray-900 to-gray-800 p-1 rounded-xl border border-gray-800 w-fit"
            >
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </motion.div>

            {/* Main Settings Card */}
            <motion.div 
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
            >
                {/* Message Alert */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mx-6 mt-6 p-4 rounded-xl flex items-center space-x-3 ${
                                message.type === 'success' 
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}
                        >
                            {message.type === 'success' ? (
                                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                            )}
                            <p className="text-sm">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Settings Form */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-center space-x-4 pb-6 border-b border-gray-800">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {formData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                                </div>
                                <button
                                    type="button"
                                    className="absolute -bottom-2 -right-2 p-1.5 bg-gray-800 rounded-lg border border-gray-700 hover:border-indigo-500 transition"
                                >
                                    <CameraIcon className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Profile Picture</h3>
                                <p className="text-sm text-gray-400">Upload a new avatar</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Section */}
                        <div className="pt-6 border-t border-gray-800">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <LockClosedIcon className="w-5 h-5 mr-2 text-indigo-400" />
                                Change Password
                            </h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        <div className="relative">
                                            <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                placeholder="Leave blank to keep current"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                                            >
                                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        <div className="relative">
                                            <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                placeholder="Confirm new password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                                            >
                                                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="space-y-2">
                                        <div className="flex space-x-1 h-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`flex-1 rounded-full transition-all duration-300 ${
                                                        formData.password.length >= level * 3
                                                            ? formData.password.length >= 12
                                                                ? 'bg-green-500'
                                                                : formData.password.length >= 8
                                                                ? 'bg-yellow-500'
                                                                : 'bg-red-500'
                                                            : 'bg-gray-700'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Password strength: {
                                                formData.password.length >= 12 ? 'Strong' :
                                                formData.password.length >= 8 ? 'Medium' :
                                                formData.password.length >= 4 ? 'Weak' : 'Too short'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="pt-6 border-t border-gray-800 flex justify-end space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                className="px-6 py-2.5 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-xl transition"
                                onClick={() => {
                                    setFormData({
                                        name: user?.name || '',
                                        email: user?.email || '',
                                        password: '',
                                        confirmPassword: ''
                                    });
                                }}
                            >
                                Reset
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Save Changes</span>
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                                <ShieldCheckIcon className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Security Settings</h3>
                            <p className="text-gray-400">Two-factor authentication and security preferences coming soon</p>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                                <BellIcon className="w-10 h-10 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Notification Preferences</h3>
                            <p className="text-gray-400">Email and push notification settings coming soon</p>
                        </div>
                    </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
                                <PaintBrushIcon className="w-10 h-10 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">App Preferences</h3>
                            <p className="text-gray-400">Theme and display settings coming soon</p>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Danger Zone */}
            <motion.div 
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl border border-red-500/20 p-6"
            >
                <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all associated data</p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition"
                >
                    Delete Account
                </motion.button>
            </motion.div>
        </div>
    );
};

export default Settings;