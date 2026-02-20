import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="text-2xl font-bold title-gradient">RestoManager</div>
                <div className="space-x-4">
                    <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-indigo-600 transition">Login</Link>
                    <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Manage your restaurant <br />
                        <span className="title-gradient">driven by Intelligence</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-xl">
                        Streamline operations, manage staff, and delight customers with our all-in-one restaurant management platform.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <Link to="/register" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">
                            Start Free Trial
                        </Link>
                        <Link to="/demo" className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">
                            Watch Demo
                        </Link>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                        alt="Restaurant Interior"
                        className="relative rounded-2xl shadow-2xl border border-gray-100 w-full object-cover h-[500px]"
                    />
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need</h2>
                        <p className="text-gray-600">Powerful features to grow your business</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Smart Orders", desc: "Process orders efficiently with our intelligent kitchen display system.", icon: "🍔" },
                            { title: "Analytics", desc: "Real-time insights into your sales, inventory, and staff performance.", icon: "📊" },
                            { title: "Customer CRM", desc: "Build loyalty with built-in customer relationship management tools.", icon: "👥" }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
