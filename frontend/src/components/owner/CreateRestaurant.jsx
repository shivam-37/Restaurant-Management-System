import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { createRestaurant } from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ChefHat,
  Home,
  ArrowRight,
  MapPin,
  Users,
  UtensilsCrossed,
  FileText,
  Image,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';

const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
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
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

const CreateRestaurant = () => {
    const { theme } = useTheme();
    const { setSelectedRestaurant } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        cuisine: '',
        image: '',
        tablesCount: 6
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // Create default tables based on tablesCount
            const tables = Array.from({ length: formData.tablesCount }, (_, i) => ({
                number: i + 1,
                capacity: i % 2 === 0 ? 4 : 2,
                status: 'Available'
            }));

            const { data } = await createRestaurant({
                name: formData.name.trim(),
                description: formData.description.trim(),
                address: formData.address.trim(),
                cuisine: formData.cuisine.trim(),
                image: formData.image.trim(),
                tables
            });

            setSelectedRestaurant(data);
        } catch (error) {
            console.error('Failed to create restaurant:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create restaurant. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center py-12 px-4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Ambient Background Pattern */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4 shadow-lg shadow-rose-500/10">
                        <ChefHat className="w-8 h-8 text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-rose-500">Create Your Restaurant</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Enter your restaurant details below to set up your management dashboard.
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="theme-card-item rounded-3xl p-6 sm:p-10 border border-rose-500/20 shadow-2xl relative overflow-hidden" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-sm text-red-500 font-medium">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Restaurant Name */}
                        <div>
                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-200">
                                Restaurant Name
                            </label>
                            <div className="relative">
                                <Home className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Royal Spice Bistro"
                                    className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Cuisine & Description Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-200">
                                    Cuisine Type
                                </label>
                                <div className="relative">
                                    <UtensilsCrossed className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Indian, Italian, Chinese"
                                        className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                        value={formData.cuisine}
                                        onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-200">
                                    Short Description
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Authentic North Indian Delicacies"
                                        className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address / Location */}
                        <div>
                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-200">
                                Address / Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 104 Main Street, Gourmet Avenue"
                                    className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Tables Count */}
                        <div>
                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-200">
                                Number of Tables
                            </label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    required
                                    className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                    value={formData.tablesCount}
                                    onChange={(e) => setFormData({ ...formData, tablesCount: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        </div>

                        {/* Restaurant Photo Upload */}
                        <div>
                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-200">
                                Restaurant Photo (Upload from device or enter URL)
                            </label>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <label className="flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl border border-rose-500/20 text-xs font-bold cursor-pointer transition shrink-0">
                                        <Upload className="w-4 h-4" />
                                        <span>Upload from Device</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const compressedDataUrl = await compressImage(file);
                                                    setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
                                                }
                                            }}
                                        />
                                    </label>
                                    <div className="relative flex-1">
                                        <Image className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Or paste image URL..."
                                            className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {formData.image && (
                                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 group">
                                        <img src={formData.image} alt="Restaurant Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-600 text-white rounded-xl transition cursor-pointer"
                                            title="Remove Photo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Creating Restaurant...</span>
                                </div>
                            ) : (
                                <>Create Restaurant <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateRestaurant;
