"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import EditProfileModal from "@/components/profile/EditProfileModal";
import SuccessModal from "@/components/settings/modals/SuccessModal";
import Edit from "@/components/icons/Edit";
import Delete from "@/components/icons/sidebar/Delete";
import EditFloorPlanModal from "@/components/profile/EditFloorPlanModal";

const Profile = () => {
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openEditFloorPlan, setOpenEditFloorPlan] = useState(false);
  const [selectedLounge, setSelectedLounge] = useState();

  const [openSuccess, setOpenSuccess] = useState(false);
  const galleryImages = Array(12).fill("/images/lounge.jfif"); // Replace with real images later
  const locations = [
    {
      _id: 1,
      name: "Main Lounge",
      address: "123 Bay Street, Downtown Toronto M5J",
      hours: "9 AM - 6 PM, Monday To Saturday",
      floorPlan: {
        image: "/images/lounge.jfif",
        tableCount: "12",
        vipCount: "4",
      },
      gallery: galleryImages,
    },
    {
      _id: 2,
      name: "Main Lounge",
      address: "123 Bay Street, Downtown Toronto M5J",
      hours: "9 AM - 6 PM, Monday To Saturday",
      floorPlan: {
        image: "/images/mapImg.png",
        tableCount: "12",
        vipCount: "4",
      },
      gallery: galleryImages,
    },
    {
      _id: 3,
      name: "Main Lounge",
      address: "123 Bay Street, Downtown Toronto M5J",
      hours: "9 AM - 6 PM, Monday To Saturday",
      floorPlan: {
        image: "/images/mapImg.png",
        tableCount: "12",
        vipCount: "4",
      },
      gallery: galleryImages,
    },
  ];

  const handleAddNewImages = () => {
    console.log("Add new images");
  };

  return (
    <div className="w-full bg-gray-50 p-6 space-y-6 overflow-auto">
      {/* Business Details */}
      <div className="grid grid-cols-2 gap-2">
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lounge Details</h2>
            <button
              onClick={() => setOpenEditProfile(true)}
              className="cursor-pointer"
            >
              <Edit />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <Image
                src="/images/profile.png"
                alt="Business"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Lounge Name</h3>
              <p className="text-gray-500 text-sm">Lounge Manager</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="bg-gray-100 rounded-md p-3 col-span-6">
              <p className="text-xs text-gray-500">Business Email Address</p>
              <p className="text-sm font-medium">designer@gmail.com</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3 col-span-6">
              <p className="text-xs text-gray-500">Business Phone Number</p>
              <p className="text-sm font-medium">+1 856 558 0215</p>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 mt-2">
            <div className="bg-gray-100 rounded-md p-3 col-span-6">
              <p className="text-xs text-gray-500">Operating Hours</p>
              <p className="text-sm font-medium">08:00 AM - 10:00 PM</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3 col-span-6">
              <p className="text-xs text-gray-500">Highlight Specialization</p>
              <p className="text-sm font-medium">+1 856 558 0215</p>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 mt-2">
            <div className="bg-gray-100 rounded-md p-3 col-span-12">
              <p className="text-xs text-gray-500">Business Location</p>
              <p className="text-sm font-medium">
                456 Maple Street, Anytown, NY 12345
              </p>
            </div>
          </div>
        </section>
        {/* Multiple Locations */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-[370px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold ">Locations</h2>
            <button className="text-black underline cursor-pointer font-medium hover:underline">
              Add New Location
            </button>
          </div>

          <div className="overflow-y-auto pr-2 space-y-3">
            {locations.map((loc, index) => (
              <div
                onClick={() => setSelectedLounge(loc)}
                key={index}
                className="flex justify-between items-center border-b pb-3 cursor-pointer"
              >
                <div>
                  <h3 className="font-medium text-sm">{loc.name}</h3>
                  <p className="text-gray-500 text-sm">{loc.address}</p>
                  <p className="text-gray-500 text-xs mt-1">{loc.hours}</p>
                </div>
                {loc._id === selectedLounge?._id && (
                  <div className="flex gap-3 me-2">
                    <span className="bg-[#010067] text-white text-[12px] py-2 px-4 rounded-2xl">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedLounge && (
        <>
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold ">Floor Plan</h2>
              <button
                onClick={() => setOpenEditFloorPlan(true)}
                className="cursor-pointer"
              >
                <Edit />
              </button>
            </div>
            <div className="w-full overflow-hidden rounded-md mb-4">
              {/* Placeholder image for now */}
              <Image
                src={selectedLounge.floorPlan.image}
                alt="Floor Plan"
                width={800}
                height={400}
                className="object-contain mx-auto"
              />
            </div>

            <div>
              <p className="font-semibold text-sm">Floor Plan Booking</p>
              <p className="text-sm text-gray-600">
                Total Tables: {selectedLounge.floorPlan.tableCount} Tables
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Total VIP Tables: {selectedLounge.floorPlan.vipCount} Tables
              </p>

              <p className="font-semibold text-sm mb-2">Available Tables</p>
              <div className="flex gap-2">
                <button className="border border-green-500 text-green-600 px-3 py-1 rounded-full text-sm">
                  {selectedLounge.floorPlan.tableCount} Normal Tables
                </button>
                <button className="border border-green-500 text-green-600 px-3 py-1 rounded-full text-sm">
                  {selectedLounge.floorPlan.vipCount} VIP Tables
                </button>
              </div>
            </div>
          </section>
          <section className="grid md:grid-cols-1 gap-6">
            {/* Gallery */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gallery</h2>
                <button
                  onClick={handleAddNewImages}
                  className="text-black underline font-medium hover:underline cursor-pointer"
                >
                  Add New Images
                </button>
              </div>{" "}
              <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-2">
                {galleryImages.map((img, index) => (
                  <div
                    key={index}
                    className="w-full h-[200px] bg-cover bg-center rounded-md overflow-hidden border border-gray-200"
                    style={{
                      backgroundImage: `url(${img})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {openEditFloorPlan && (
        <EditFloorPlanModal
          open={openEditFloorPlan}
          setOpen={setOpenEditFloorPlan}
          onSave={(data) => {
            console.log("Save floor plan:", data);
            setOpenEditFloorPlan(false);
            setOpenSuccess(true);
            // TODO: Call API to update profile
          }}
        />
      )}

      <EditProfileModal
        open={openEditProfile}
        setOpen={setOpenEditProfile}
        onSave={(data) => {
          console.log("Save profile:", data);
          setOpenEditProfile(false);
          setOpenSuccess(true);
          // TODO: Call API to update profile
        }}
      />

      <SuccessModal
        open={openSuccess}
        setOpen={setOpenSuccess}
        title="Profile Updated!"
        message="Your profile has been updated successfully."
      />
    </div>
  );
};

export default Profile;
