import React from "react";
import Card from "./Card";

const CampaignAndFlyersGrid = () => {
  const campaignAndFlyers = [
    {
      id: 1,
      title: "Spring Sale",
      image: "/images/flyer.png",
    },
    {
      id: 2,
      title: "Winter Clearance",
      image: "/images/flyer.png",
    },
    {
      id: 3,
      title: "Summer Festival",
      image: "/images/flyer.png",
    },
    {
      id: 4,
      title: "Fall Harvest",
      image: "/images/flyer.png",
    },
    {
      id: 5,
      title: "Spring Sale",
      image: "/images/flyer.png",
    },
    {
      id: 6,
      title: "Winter Clearance",
      image: "/images/flyer.png",
    },
    {
      id: 7,
      title: "Summer Festival",
      image: "/images/flyer.png",
    },
    {
      id: 8,
      title: "Fall Harvest",
      image: "/images/flyer.png",
    },
    {
      id: 9,
      title: "Spring Sale",
      image: "/images/flyer.png",
    },
    {
      id: 10,
      title: "Winter Clearance",
      image: "/images/flyer.png",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-y-auto h-full p-5">
      <div className="grid grid-cols-5 gap-x-3 gap-y-6">
        {campaignAndFlyers?.map((campaign, index) => (
          <Card key={index} data={campaign} />
        ))}
      </div>
    </div>
  );
};

export default CampaignAndFlyersGrid;
