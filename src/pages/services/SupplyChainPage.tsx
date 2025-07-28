import React from 'react';
import { LucidePackageSearch, LucideNetwork, LucideWarehouse } from 'lucide-react';

  const SupplyChainPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50  ">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-20 lg:py-20">
                    <div className="pt-5 items-center">
                        <h1 className="text-4xl font-bold text-indigo-100 text-center mb-10">
                            Supply <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Chain Solutions</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto py-7">
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <LucideNetwork size={24} className="text-indigo-600" />
                        <h2 className="text-xl font-semibold">Integrated Logistics</h2>
                    </div>
                    <p className="text-gray-700">
                        We manage every link in your supply chain, from sourcing to delivery. Our platform ensures real-time coordination across vendors, warehouses, and distributors.
                    </p>
                </div>

                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <LucideWarehouse size={24} className="text-indigo-600" />
                        <h2 className="text-xl font-semibold">Smart Warehousing</h2>
                    </div>
                    <p className="text-gray-700">
                        Our advanced warehouses use automation, inventory AI, and IoT sensors to maintain visibility, efficiency, and reduce storage costs.
                    </p>
                </div>

                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <LucidePackageSearch size={24} className="text-indigo-600" />
                        <h2 className="text-xl font-semibold">Visibility & Analytics</h2>
                    </div>
                    <p className="text-gray-700">
                        Make smarter decisions with full end-to-end visibility and predictive analytics. We provide custom dashboards and automated reporting tools tailored to your needs.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default SupplyChainPage;
