// import React from 'react';
import { useNavigate } from 'react-router-dom';

const TabLink = ({ tab }: any) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/services#${tab.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition duration-200 shadow-md flex items-center gap-2"
    >
      <tab.icon size={18} />
      {tab.name}
    </button>
  );
};

export default TabLink;
