import React from "react";

const StatsCard = ({ stats }) => {
  return (
    <div className="bg-gradient-stats rounded-lg p-5 flex gap-5 justify-between items-center">
      <div>
        <p className="text-[#20222499] mb-3">{stats.title}</p>
        <p className="text-[#202224] text-3xl font-bold">{stats.value}</p>
      </div>

      <div className="bg-gradient w-14 h-14 rounded-lg flex justify-center items-center">
        {stats.icon}
      </div>
    </div>
  );
};

export default StatsCard;
