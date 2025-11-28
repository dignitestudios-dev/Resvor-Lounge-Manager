/* eslint-disable react/prop-types */

import { FaArrowLeftLong } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import AuthButton from "../auth/AuthButton";
import { useState } from "react";
import Link from "next/link";

const MultipleLounge = ({
  handleNext,
  handlePrevious,
  setCurrentStep,
  loungeData,
  floorPlan,
}) => {
  // Sample lounge data - replace with actual data from props or state management
  const [lounge, setLounge] = useState(
    loungeData || {
      name: "John Alex",
      email: "john.alex@gmail.com",
      phone: "+000 0000 00",
      hours: "08:00pm - 01:00am",
      specialization: "Specialization Title",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: null,
    }
  );

  const handleEdit = () => {
    console.log("Edit lounge:", lounge);
    // Add edit functionality here
  };

  const handleDelete = () => {
    console.log("Delete lounge:", lounge);
    // Add delete functionality here
  };

  return (
    <div className="flex flex-col justify-center items-center h-auto w-[550px]">
      <div className="flex justify-start items-center absolute top-12 left-0">
        <button type="button" onClick={() => handlePrevious()}>
          <FaArrowLeftLong color="white" size={24} />
        </button>
      </div>

      <div className="mt-4 text-center space-y-4">
        <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
          Multiple Lounge <br />
          Account
        </p>
        <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]">
          Register your Lounge to start Booking online.
        </p>
      </div>

      <div className="space-y-6 mt-10">
        {/* Add New Lounge Button */}
        <div
          onClick={() => setCurrentStep(3)}
          className="border-2 border-dashed cursor-pointer border-white/30 rounded-[20px] p-8 flex flex-col items-center justify-center min-h-[120px]"
        >
          <div className="text-center text-white/70">
            <div className="text-2xl mb-2">+</div>
            <p className="underline">Add a New Lounge Profile</p>
          </div>
        </div>

        {/* Lounge Card */}
        <div className="rounded-[20px] border-2 border-white/20 bg-white/5 backdrop-blur p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-[80px] h-[80px] rounded-full overflow-hidden">
                <img
                  src="/images/profile.png"
                  alt="lounge"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white font-[600] text-lg">{lounge.name}</p>
                <p className="text-[#BEC2C9] text-sm">{lounge.email}</p>
                <p className="text-[#BEC2C9] text-sm">{lounge.phone}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <MdEdit color="white" size={20} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/20 rounded-lg transition"
              >
                <MdDelete color="#ef4444" size={20} />
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-[#BEC2C9] text-sm">
              <span className="text-white font-[500]">{lounge.hours}</span> |{" "}
              <span className="text-white font-[500]">
                {lounge.specialization}
              </span>
            </p>
            <p className="text-[#BEC2C9] text-sm">{lounge.description}</p>
          </div>
        </div>

        {/* Floor Plan Preview */}
        {floorPlan && (
          <div className="rounded-[20px] border-2 border-white/20 bg-white/5 backdrop-blur p-4">
            <p className="text-white font-[500] mb-3">Floor Plan</p>
            <img
              src={
                typeof floorPlan === "string"
                  ? floorPlan
                  : URL.createObjectURL(floorPlan)
              }
              alt="floor plan"
              className="w-full h-[200px] object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="xxl:w-[650px] w-[350px] mt-1 mb-4">
          <AuthButton text={"Next"} onClick={handleNext} />
        </div>
      </div>
    </div>
  );
};

export default MultipleLounge;
