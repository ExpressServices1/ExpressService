import React from 'react';
import { Star, Truck, Globe, Plane, LucideIcon } from 'lucide-react';

type Plan = {
  name: string;
  price: string;
  features: string[];
  icon: LucideIcon; 
  popular: boolean;
  gradient: string;
};

type PricingPlansProps = {
  className?: string;
};

const pricingData: Plan[] = [
  {
    name: 'Express Shipping',
    price: 'Starting at $720',
    icon: Truck, 
    features: ['12 days delivery', 'Basic tracking', 'Up to 10kg', 'Standard support', 'Real-Time Tracking'],
    popular: false,
    gradient: 'from-gray-900 to-gray-700',
  },
  {
    name: 'International Shipping',
    price: 'Starting at $1550',
    icon: Globe,
    features: ['8 days delivery', 'Priority tracking', 'Up to 25kg', 'Priority support', 'Customs Assistance'],
    popular: true,
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    name: 'Freight Services',
    price: 'Starting at $4200',
    icon: Plane,
    features: ['2 days delivery', 'Real-time GPS', 'Up to 50kg', '24/7 dedicated support', 'Bulk Cargo Transport', 'Insurance Available'],
    popular: false,
    gradient: 'from-purple-600 to-pink-600',
  },
];

const PricingPlans: React.FC<PricingPlansProps> = ({ className = '' }) => {
  return (
    <div className={`grid md:grid-cols-3 gap-8 ${className}`}>
      {pricingData.map((plan, index) => {
        const Icon = plan.icon;
        return (
          <div
            key={index}
            className={`relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              plan.popular ? 'ring-4 ring-blue-500/20 scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <Icon className="mx-auto h-10 w-10 text-indigo-500 mb-4" /> 
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div
                className={`text-1xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent mb-4`}
              >
                {plan.price}
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Star className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default PricingPlans;
