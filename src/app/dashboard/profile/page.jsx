"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import EditProfileModal from "@/components/profile/EditProfileModal";
import SuccessModal from "@/components/settings/modals/SuccessModal";
import Edit from "@/components/icons/Edit";
import Delete from "@/components/icons/sidebar/Delete";
import EditFloorPlanModal from "@/components/profile/EditFloorPlanModal";
import CreateLoungeModal from "@/components/lounge-components/CreateLoungeModal";
import AddGalleryImagesModal from "@/components/profile/AddGalleryImagesModal";
import { useQueryClient } from "@tanstack/react-query";
import { useGetActiveLounge } from "@/lib/hooks/queries/useLounges";
import { useUpdateLounge } from "@/lib/hooks/mutations/LoungeMutations";
import PageLoader from "@/components/common/PageLoader";
import { ErrorToast } from "@/components/ui/toaster";

const Profile = () => {
  const queryClient = useQueryClient();
  const { data: activeLounge, isLoading } = useGetActiveLounge();
  const updateLoungeMutation = useUpdateLounge();
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openEditFloorPlan, setOpenEditFloorPlan] = useState(false);
  const [addLocation, setAddLocation] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] = useState(false);
  const [openAddGalleryImages, setOpenAddGalleryImages] = useState(false);

  const [openSuccess, setOpenSuccess] = useState(false);


  const handleAddNewImages = (images) => {
    if (images && images.length > 0) {
      updateLoungeMutation.mutate({ images }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["active-lounge"] });
          setOpenAddGalleryImages(false);
          setOpenSuccess(true);
        },
        onError: (error) => {
          ErrorToast(error.response?.data?.message || "Failed to add gallery images. Please try again.");
        }
      });
    }
  };

  const onOpenEditFloorPlan = () => {
    setOpenEditFloorPlan(true);
    setEditingFloorPlan(true);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  const formattedRole = activeLounge?.role === "lounge_manager"
    ? "Lounge Manager"
    : activeLounge?.role === "promoter"
      ? "Promoter"
      : activeLounge?.role || "Lounge Manager";

  const displayGalleryImages = activeLounge?.images && activeLounge.images.length > 0
    ? activeLounge.images.map((img) => img.location)
    : [];

  const totalTablesCount = (activeLounge?.floorPlan?.regularTables || 0) + (activeLounge?.floorPlan?.vipTables || 0);

  return (
    <div className="w-full bg-gray-50 p-6 space-y-6 overflow-auto">
      {/* Business Details */}
      <div className="grid grid-cols-2 gap-2">
        {/* Multiple Locations */}
        {/* {selectedLounge && (
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-[370px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold ">Locations</h2>
              <button
                onClick={() => setAddLocation(true)}
                className="text-black underline cursor-pointer font-medium hover:underline"
              >
                Add New Lounge
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
        )} */}



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
            <div className="w-16 h-16 rounded-full overflow-hidden relative border border-gray-200">
              <Image
                src={activeLounge?.logo?.location || "/images/lounge.jfif"}
                alt="Business"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{activeLounge?.name || "Lounge Name"}</h3>
              <p className="text-gray-500 text-sm">{formattedRole}</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="bg-gray-100 rounded-md p-3 col-span-6">
              <p className="text-xs text-gray-500">Business Email Address</p>
              <p className="text-sm font-medium">{activeLounge?.businessEmail || "designer@gmail.com"}</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3 col-span-6">
              <p className="text-xs text-gray-500">Business Phone Number</p>
              <p className="text-sm font-medium">{activeLounge?.businessPhone || "+1 856 558 0215"}</p>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 mt-2">
            <div className="bg-gray-100 rounded-md p-3 col-span-6">
              <p className="text-xs text-gray-500">Operating Hours</p>
              <p className="text-sm font-medium">
                {activeLounge?.operatingHours?.open && activeLounge?.operatingHours?.close
                  ? `${activeLounge.operatingHours.open} - ${activeLounge.operatingHours.close}`
                  : "08:00 AM - 10:00 PM"}
              </p>
            </div>
            <div className="bg-gray-100 rounded-md p-3 col-span-6">
              <p className="text-xs text-gray-500">
                Highlight Specialization
              </p>
              <p className="text-sm font-medium">{activeLounge?.specialization || "Lorem Ipsum dollar"}</p>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 mt-2">
            <div className="bg-gray-100 rounded-md p-3 col-span-12">
              <p className="text-xs text-gray-500">Business Location</p>
              <p className="text-sm font-medium">
                {activeLounge?.location?.address || "456 Maple Street, Anytown, NY 12345"}
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end items-start mb-4">
          <button
            onClick={() => setAddLocation(true)}
            className="text-black underline cursor-pointer font-medium hover:underline"
          >
            Add New Lounge
          </button>
        </div>

      </div>

      <>
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold ">Floor Plan</h2>
            <button onClick={onOpenEditFloorPlan} className="cursor-pointer">
              <Edit />
            </button>
          </div>
          <div className="w-full overflow-hidden rounded-md mb-4">
            <Image
              src={activeLounge?.floorPlan?.image?.location || "/images/lounge.jfif"}
              alt="Floor Plan"
              width={800}
              height={400}
              className="object-contain mx-auto max-h-[350px]"
            />
          </div>

          <div>
            <p className="font-semibold text-sm">Floor Plan Booking</p>
            <p className="text-sm text-gray-600">
              Total Tables: {totalTablesCount} Tables
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Total VIP Tables: {activeLounge?.floorPlan?.vipTables || 0} Tables
            </p>

            <p className="font-semibold text-sm mb-2">Available Tables</p>
            <div className="flex gap-2">
              <button className="border border-green-500 text-green-600 px-3 py-1 rounded-full text-sm">
                {activeLounge?.floorPlan?.regularTables || 0} Normal Tables
              </button>
              <button className="border border-green-500 text-green-600 px-3 py-1 rounded-full text-sm">
                {activeLounge?.floorPlan?.vipTables || 0} VIP Tables
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
                onClick={() => setOpenAddGalleryImages(true)}
                className="text-black underline font-medium hover:underline cursor-pointer"
              >
                Add New Images
              </button>
            </div>{" "}
            <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-2">
              {displayGalleryImages.length > 0 ? (
                displayGalleryImages.map((img, index) => (
                  <div
                    key={index}
                    className="w-full h-[200px] bg-cover bg-center rounded-md overflow-hidden border border-gray-200"
                    style={{
                      backgroundImage: `url(${img})`,
                    }}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-sm italic col-span-4 text-center my-8">
                  No gallery images uploaded yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </>

      <CreateLoungeModal
        open={addLocation}
        setOpen={setAddLocation}
        handleNext={() => {
          setAddLocation(false);
          queryClient.invalidateQueries({ queryKey: ["lounges-list"] });
        }}
      />

      <AddGalleryImagesModal
        open={openAddGalleryImages}
        setOpen={setOpenAddGalleryImages}
        isLoading={updateLoungeMutation.isPending}
        onAdd={handleAddNewImages}
      />

      <EditFloorPlanModal
        open={openEditFloorPlan}
        setOpen={setOpenEditFloorPlan}
        isEdit={editingFloorPlan}
        onEditChange={setEditingFloorPlan}
        lounge={activeLounge}
        isLoading={updateLoungeMutation.isPending}
        onSave={(data) => {
          const payload = {};
          if (data.floorPlanFile) {
            payload.floorPlan = data.floorPlanFile;
          }
          if (data.regularTables !== "" && Number(data.regularTables) !== Number(activeLounge?.floorPlan?.regularTables)) {
            payload.regularTables = Number(data.regularTables);
          }
          if (data.vipTables !== "" && Number(data.vipTables) !== Number(activeLounge?.floorPlan?.vipTables)) {
            payload.vipTables = Number(data.vipTables);
          }

          if (Object.keys(payload).length > 0) {
            updateLoungeMutation.mutate(payload, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["active-lounge"] });
                setOpenEditFloorPlan(false);
                setOpenSuccess(true);
              },
              onError: (error) => {
                ErrorToast(error.response?.data?.message || "Failed to update floor plan. Please try again.");
              }
            });
          } else {
            setOpenEditFloorPlan(false);
          }
        }}
      />

      <EditProfileModal
        open={openEditProfile}
        setOpen={setOpenEditProfile}
        lounge={activeLounge}
        isLoading={updateLoungeMutation.isPending}
        onSave={(data) => {
          const payload = {};
          if (data.loungeName !== activeLounge?.name) {
            payload.name = data.loungeName;
          }
          const currentHours = activeLounge?.operatingHours
            ? `${activeLounge.operatingHours.open} - ${activeLounge.operatingHours.close}`
            : "";
          if (data.operatingHours !== currentHours) {
            payload.operatingHours = data.operatingHours;
          }
          if (data.specialization !== activeLounge?.specialization) {
            payload.specialization = data.specialization;
          }
          if (data.businessLocation !== activeLounge?.location?.address) {
            payload.location = data.businessLocation;
          }
          if (data.logoFile) {
            payload.userImage = data.logoFile;
          }

          if (Object.keys(payload).length > 0) {
            updateLoungeMutation.mutate(payload, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["active-lounge"] });
                setOpenEditProfile(false);
                setOpenSuccess(true);
              },
              onError: (error) => {
                ErrorToast(error.response?.data?.message || "Failed to update profile. Please try again.");
              }
            });
          } else {
            setOpenEditProfile(false);
          }
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
