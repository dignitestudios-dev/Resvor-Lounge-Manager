
"use client";

import AddBartenderForm from "@/components/bartender/AddBartenderForm";
import DeleteBartenderPopup from "@/components/bartender/DeleteBartenderPopup";
import UpdatePasswordModal from "@/components/bartender/UpdatePasswordModal";
import Delete from "@/components/icons/Delete";
import { Button } from "@/components/ui/button";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import { useDeleteBartender } from "@/lib/hooks/mutations/BartenderMutations";
import { useGetBartenderById } from "@/lib/hooks/queries/useBartenders";
import { Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";

const BartenderDetails = () => {
  const router = useRouter();
  const params = useParams();

  const bartenderId = params.id;

  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const {
    data: bartender,
    isLoading,
    isError,
  } = useGetBartenderById(bartenderId);

  const {
    mutate: deleteBartender,
    isPending: isDeleting,
  } = useDeleteBartender();

  // Normalize profile image URL
  const profileImageUrl =
    typeof bartender?.profileImage === "string"
      ? bartender.profileImage
      : bartender?.profileImage?.location || "/images/profile.png";

  // Delete bartender
  const handleDelete = () => {
    deleteBartender(bartenderId, {
      onSuccess: () => {
        SuccessToast("Worker deleted successfully.");
        router.push("/dashboard/bartenders");
      },
      onError: (error) => {
        ErrorToast(
          error?.response?.data?.message || "Failed to delete worker."
        );
        setOpenDeletePopup(false);
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  // Error state
  if (isError || !bartender) {
    return (
      <div className="flex justify-center items-center py-20 text-red-500">
        Failed to load workforce details.
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 min-w-0 w-full max-w-full flex flex-col overflow-hidden">

        {/* Page Heading */}
        <h1 className="section-heading shrink-0">
          Work Force Details
        </h1>

        {/* Main Content */}
        <div className="mt-10 flex-1 min-h-0 min-w-0 w-full max-w-full bg-white rounded-2xl p-5 overflow-y-auto overflow-x-hidden">

          <div className="flex flex-col min-w-0 w-full max-w-full bg-[#F5F5F5] rounded-2xl p-5 gap-5">

            {/* Header Card */}
            <div className="w-full min-w-0 max-w-full bg-white rounded-2xl p-5 overflow-hidden">

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 min-w-0">

                {/* Profile Information */}
                <div className="flex items-center gap-4 min-w-0 flex-1 w-full">

                  {/* Profile Image */}
                  <div
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-center bg-cover bg-primary shrink-0"
                    style={{
                      backgroundImage: `url(${profileImageUrl})`,
                    }}
                  />

                  {/* Name and Email */}
                  <div className="min-w-0 flex-1">

                    <p className="text-black text-xl sm:text-3xl font-bold whitespace-normal break-words [overflow-wrap:anywhere]">
                      {bartender.fullName || "—"}
                    </p>

                    {bartender.jobTitle && (
                      <p className="text-sm font-semibold text-[#0B0E52] mt-1 whitespace-normal break-words [overflow-wrap:anywhere]">
                        {bartender.jobTitle}
                      </p>
                    )}

                    <p className="text-gray-500 whitespace-normal break-words [overflow-wrap:anywhere]">
                      {bartender.email || "—"}
                    </p>

                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap shrink-0">

                  {/* Update Password */}
                  <Button
                    className="h-14 px-5 gap-2 bg-blue-900 hover:bg-blue-800 whitespace-nowrap"
                    onClick={() => setOpenPasswordModal(true)}
                  >
                    Update Password
                  </Button>

                  {/* Delete */}
                  <Button
                    className="bg-red-400 hover:bg-red-500 w-14! h-14! shrink-0"
                    onClick={() => setOpenDeletePopup(true)}
                  >
                    <Delete className="scale-150" />
                  </Button>

                  {/* Edit */}
                  <AddBartenderForm
                    isOpen={openEditForm}
                    onOpenChange={setOpenEditForm}
                    isEdit={true}
                    data={bartender}
                  />

                </div>
              </div>
            </div>

            {/* Basic Details Card */}
            <div className="w-full min-w-0 max-w-full bg-white rounded-2xl p-5 overflow-hidden">

              <h1 className="section-heading border-b pb-5">
                Basic Details
              </h1>

              {/* Full Name */}
              <div className="py-4 border-b min-w-0">
                <p className="text-gray-500">
                  Full Name
                </p>

                <p className="text-black font-medium text-lg whitespace-normal break-words [overflow-wrap:anywhere]">
                  {bartender.fullName || "—"}
                </p>
              </div>

              {/* Job Title */}
              <div className="py-4 border-b min-w-0">
                <p className="text-gray-500">
                  Job Title
                </p>

                <p className="text-black font-medium text-lg whitespace-normal break-words [overflow-wrap:anywhere]">
                  {bartender.jobTitle || "—"}
                </p>
              </div>

              {/* Email */}
              <div className="py-4 border-b min-w-0">
                <p className="text-gray-500">
                  Email Address
                </p>

                <p className="text-black font-medium text-lg whitespace-normal break-words [overflow-wrap:anywhere]">
                  {bartender.email || "—"}
                </p>
              </div>

              {/* Phone */}
              <div className="py-4 border-b min-w-0">
                <p className="text-gray-500">
                  Phone Number
                </p>

                <p className="text-black font-medium text-lg whitespace-normal break-words [overflow-wrap:anywhere]">
                  {formatPhoneNumber(bartender.phoneNumber) || "—"}
                </p>
              </div>

              {/* Address */}
              <div className="py-4 border-b min-w-0">
                <p className="text-gray-500">
                  Address
                </p>

                <p className="text-black font-medium text-lg whitespace-normal break-words [overflow-wrap:anywhere]">
                  {bartender.address || "—"}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Update Password Modal */}
      <UpdatePasswordModal
        isOpen={openPasswordModal}
        onOpenChange={setOpenPasswordModal}
        bartenderId={bartenderId}
      />

      {/* Delete Popup */}
      <DeleteBartenderPopup
        isOpen={openDeletePopup}
        onOpenChange={setOpenDeletePopup}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default BartenderDetails;
