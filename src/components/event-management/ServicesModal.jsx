/* eslint-disable react/prop-types */
import { RxCross2 } from "react-icons/rx";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { formatCentsToUSD } from "@/lib/utils";

const ServicesModal = ({
  isOpen,
  onClose,
  setServiceModalData,
  loungeServices = [],
  initialSelectedServices = [],
}) => {
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedServices(initialSelectedServices || []);
    }
  }, [isOpen, initialSelectedServices]);

  const handleDateData = () => {
    setServiceModalData(selectedServices);
    onClose();
  };

  const handleToggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0A150F80] bg-opacity-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg max-h-[680px] w-[915px] p-10 relative flex flex-col">
        <button
          type="button"
          className="absolute top-5 right-6 cursor-pointer focus:outline-none"
          onClick={onClose}
        >
          <RxCross2 className="w-5 h-5 text-gray-700" />
        </button>

        <h2 className="text-[28px] font-bold mb-4">Services and Packages</h2>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          <div className="space-y-4 text-[#6B6B6B]">
            {loungeServices.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No services or packages available for this lounge.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {loungeServices.map((item) => {
                  const isAdded = selectedServices.some((s) => s.id === item.id);
                  const imageUrl =
                    item.images?.[0]?.location ||
                    item.images?.[1]?.location ||
                    "/images/service.jpg"; // fallback

                  return (
                    <div
                      key={item.id}
                      className="rounded-[16px] p-4 bg-[#f6f5f5] flex flex-col justify-between h-[360px] border border-gray-100"
                    >
                      <div className="overflow-hidden rounded-[12px] h-[150px] w-full bg-gray-200 relative">
                        <img
                          src={imageUrl}
                          className="w-full h-full object-cover"
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "/images/service.jpg";
                          }}
                        />
                      </div>

                      <div className="my-2 flex-1 flex flex-col">
                        <p className="text-[16px] text-blue-950 font-[600] line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[12px] text-gray-500 mt-1 line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="my-2">
                        <p className="text-indigo-950 text-[18px] font-[700]">
                          Price: {formatCentsToUSD(item.price)}
                        </p>
                      </div>

                      <div className="w-full flex justify-center">
                        <div className="w-full">
                          <Button
                            className="w-full h-9 rounded-lg"
                            variant={isAdded ? "destructive" : "default"}
                            type="button"
                            onClick={() =>
                              handleToggleService({
                                id: item.id,
                                title: item.name,
                                price: item.price,
                              })
                            }
                          >
                            {isAdded ? "Remove" : "Add to Booking"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDateData}
            type="button"
            className="bg-gradient-to-l from-[#012C57] to-[#061523] text-white text-[13px] px-6 py-3 rounded-[12px] w-[350px] font-semibold hover:opacity-95 transition cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;
