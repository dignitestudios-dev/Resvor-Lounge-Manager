import React from "react";
import { LuLoaderCircle } from "react-icons/lu";

const PageLoader = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <LuLoaderCircle className="animate-spin text-desc2" size={36} />
    </div>
  );
};

export default PageLoader;
