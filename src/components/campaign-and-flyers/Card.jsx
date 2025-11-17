import Image from "next/image";
import Link from "next/link";
import React from "react";

const Card = ({ data }) => {
  const { title, image } = data;
  return (
    <Link href={`/dashboard/campaign-and-flyers/${data.id}`}>
      <div className="w-full">
        <div className="w-full rounded-lg p-1.5 border border-gray-200 h-64">
          <Image
            src={image}
            alt={title}
            width={100}
            height={100}
            className="h-full w-full object-contain"
          />
        </div>
        <p className="text-center text-[#202224] font-semibold mt-2">{title}</p>
      </div>
    </Link>
  );
};

export default Card;
