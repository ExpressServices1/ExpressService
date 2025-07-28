import React from 'react';
import PricingPlans from '../components/PricingSection';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center ">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 pt-32 pb-16">
          <h1 className="text-4xl font-bold text-indigo-100 mb-4">Shipping & Delivery  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Pricing </span></h1>
          <p className="text-indigo-100 text-lg">
            Flexible, transparent pricing options tailored to your delivery needs. Select the service that suits your timeline and budget.
          </p>
        </div>
      </div>


      <PricingPlans className="py-20 px-6" />
    </div>
  );
};

export default PricingPage;
