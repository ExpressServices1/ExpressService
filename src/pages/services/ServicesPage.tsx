import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LucideTruck, LucideGlobe, LucideShip } from 'lucide-react';
import ServiceSection from '../../components/ServiceSection';
import TabLink from '../../components/TabLink';

const serviceTabs = [
  {
    name: 'Express Shipping',
    icon: LucideTruck,
    id: 'express',
    description: `Our Express Shipping service is tailored for speed and urgency. With same-day and next-day delivery options, we ensure rapid transit of time-sensitive packages across local and regional destinations. Ideal for e-commerce, medical, and legal sectors, our express solutions offer real-time tracking, secure handling, and guaranteed delivery windows.`
  },
  {
    name: 'International Shipping',
    icon: LucideGlobe,
    id: 'international',
    description: `Expand your reach globally with our International Shipping solutions. We provide seamless cross-border logistics via air, sea, and land. Our service includes customs clearance, regulatory compliance, and door-to-door delivery in over 220 countries. Partnered with global carriers, we ensure timely and cost-effective movement of goods across continents.`
  },
  {
    name: 'Freight Services',
    icon: LucideShip,
    id: 'freight',
    description: `Our Freight Services support high-volume, heavy, or palletized shipments via air, ocean, and ground transport. Whether full-truckload (FTL), less-than-truckload (LTL), or intermodal freight, we optimize routes, reduce costs, and provide end-to-end visibility. Ideal for industrial, retail, and manufacturing supply chains.`
  },

];


const ServicesPage: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const section = document.querySelector(hash);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50  ">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-20 lg:py-20">
          <div className=" items-center">

            <h1 className="text-4xl font-bold text-indigo-100 mb-6 text-center pt-10">Our  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Services</span></h1>

            <div className="flex flex-wrap justify-center gap-4 mb-10 text-white">
              {serviceTabs.map(tab => (
                <TabLink key={tab.id} tab={tab} />
              ))}

            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-12 px-8 py-7">
        {serviceTabs.map(tab => (
          <ServiceSection key={tab.id} tab={tab} />
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
