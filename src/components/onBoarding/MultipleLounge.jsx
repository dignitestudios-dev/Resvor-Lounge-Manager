/* eslint-disable react/prop-types */

import { FaArrowLeftLong } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import AuthButton from "../auth/AuthButton";
import { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "../../axios";

const MultipleLounge = ({
  handleNext,
  // handlePrevious,
  setCurrentStep,
  setCurrentState,
  // loungeData,
  // floorPlan,
}) => {
  const [lounges, setLounges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch lounges from API
  useEffect(() => {
    const fetchLounges = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/lounges/list");
        if (response.data.success && response.data.data) {
          setLounges(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching lounges:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLounges();
  }, []);

  const handleEdit = (lounge) => {
    console.log("Edit lounge:", lounge);
    // Add edit functionality here
  };

  const handleDelete = (lounge) => {
    console.log("Delete lounge:", lounge);
    // Add delete functionality here
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[550px] mx-auto px-4">
      {/* Heading */}
      <div className="mt-4 text-center space-y-4 shrink-0">
        <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize leading-tight">
          Multiple Lounge <br />
          Account
        </p>

        <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]">
          Register your Lounge to start Booking online.
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="w-full mt-10 flex flex-col min-h-0">
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {/* Add New Lounge Button */}
          {/* <div
            onClick={() => {
              setCurrentStep(3);
              setCurrentState("personalDetails");
            }}
            className="border-2 border-dashed cursor-pointer border-white/30 rounded-[20px] p-8 flex flex-col items-center justify-center min-h-[120px]"
          >
            <div className="text-center text-white/70">
              <div className="text-2xl mb-2">+</div>
              <p className="underline">Add a New Lounge Profile</p>
            </div>
          </div> */}

          {/* Loading State */}
          {loading && (
            <div className="rounded-[20px] border-2 border-white/20 bg-white/5 backdrop-blur p-6 text-center text-white">
              <p>Loading lounges...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-[20px] border-2 border-red-500/50 bg-red-500/10 backdrop-blur p-6 text-center text-red-400">
              <p>Error: {error}</p>
            </div>
          )}

          {/* Lounge Cards */}
          {!loading && !error && lounges.length > 0 && (
            <div
              key={lounges[0]._id}
              className="rounded-[20px] border-2 border-white/20 bg-white/5 backdrop-blur p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0">
                    <img
                      src={
                        lounges[0].logo?.location || "/images/dummyAvatar.png"
                      }
                      alt={lounges[0].name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-white font-[600] text-lg truncate">
                      {lounges[0].name}
                    </p>

                    <p className="text-[#BEC2C9] text-sm break-all">
                      {lounges[0].businessEmail}
                    </p>

                    <p className="text-[#BEC2C9] text-sm">
                      {lounges[0].businessPhone}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(lounges[0])}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <MdEdit color="white" size={20} />
                  </button>

                  <button
                    onClick={() => handleDelete(lounges[0])}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition"
                  >
                    <MdDelete color="#ef4444" size={20} />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-[#BEC2C9] text-sm leading-relaxed">
                  <span className="text-white font-[500]">
                    {lounges[0].operatingHours?.open} -{" "}
                    {lounges[0].operatingHours?.close}
                  </span>{" "}
                  |{" "}
                  <span className="text-white font-[500]">
                    {lounges[0].specialization}
                  </span>
                </p>

                <p className="text-[#BEC2C9] text-sm break-words">
                  {lounges[0].description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Button */}
        <div className="w-full mt-6 shrink-0">
          <AuthButton text={"Next"} onClick={handleNext} />
        </div>
      </div>
    </div>
  );
};

export default MultipleLounge;
