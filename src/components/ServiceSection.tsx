import React from 'react';

interface TabProps {
  tab: {
    name: string;
    icon: React.ElementType;
    id: string;
    description: string;
  };
}

const ServiceSection: React.FC<TabProps> = ({ tab }) => {
  return (
    <section
      id={tab.id}
      className="scroll-mt-28 bg-white/30 rounded-2xl p-6 shadow-xl backdrop-blur-md"
    >
      <div className="flex items-center gap-4 mb-3">
        <tab.icon size={28} className="text-indigo-600" />
        <h2 className="text-2xl font-semibold text-indigo-900 mt-2">{tab.name}</h2>
      </div>
      <p className="text-gray-700 text-base leading-relaxed">
        {tab.description}
      </p>
    </section>
  );
};

export default ServiceSection;
