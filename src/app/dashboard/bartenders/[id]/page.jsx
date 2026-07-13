"use client";
import AddBartenderForm from "@/components/bartender/AddBartenderForm";
import DeleteBartenderPopup from "@/components/bartender/DeleteBartenderPopup";
import UpdatePasswordModal from "@/components/bartender/UpdatePasswordModal";
import Delete from "@/components/icons/Delete";
import { Button } from "@/components/ui/button";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import { useDeleteBartender } from "@/lib/hooks/mutations/BartenderMutations";
import { useGetBartenderById } from "@/lib/hooks/queries/useBartenders";
import { KeyRound, Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const BartenderDetails = () => {
  const router = useRouter();
  const params = useParams();
  const bartenderId = useMemo(() => params.id, [params]);

  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const { data: bartender, isLoading, isError } = useGetBartenderById(bartenderId);
  const { mutate: deleteBartender, isPending: isDeleting } = useDeleteBartender();

  // profileImage is an object { location: "url", ... } – normalise to a URL string
  const profileImageUrl =
    typeof bartender?.profileImage === "string"
      ? bartender.profileImage
      : bartender?.profileImage?.location || "/images/profile.png";

  const handleDelete = () => {
    deleteBartender(bartenderId, {
      onSuccess: () => {
        SuccessToast("Bartender deleted successfully.");
        router.push("/dashboard/bartenders");
      },
      onError: (error) => {
        ErrorToast(
          error?.response?.data?.message || "Failed to delete bartender."
        );
        setOpenDeletePopup(false);
      },
    });
  };

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (isError || !bartender) {
    return (
      <div className="flex justify-center items-center py-20 text-red-500">
        Failed to load bartender details.
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <h1 className="section-heading">Work Force Details</h1>

        <div className="mt-10 flex-1 bg-white rounded-2xl p-5 overflow-y-auto">
          <div className="flex flex-col bg-[#F5F5F5] rounded-2xl h-full p-5 space-y-5 overflow-y-auto">

            {/* ── Header card ── */}
            <div className="w-full bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between gap-5 flex-wrap">
                {/* Avatar + name */}
                <div className="flex items-center gap-5">
                  <div
                    className="w-28 h-28 rounded-full bg-center bg-cover bg-primary flex-shrink-0"
                    style={{ backgroundImage: `url(${profileImageUrl})` }}
                  />
                  <div>
                    <p className="text-black text-3xl! font-bold">
                      {bartender.fullName}
                    </p>
                    <p className="text-gray-500">{bartender.email}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {/* Update Password button */}
                  <Button
                    className="h-14 px-5 gap-2 bg-blue-900 hover:bg-blue-800"
                    onClick={() => setOpenPasswordModal(true)}
                  >
                    <KeyRound className="w-5 h-5" />
                    Update Password
                  </Button>

                  {/* Delete button */}
                  <Button
                    className="bg-red-400 hover:bg-red-500 w-14! h-14!"
                    onClick={() => setOpenDeletePopup(true)}
                  >
                    <Delete className="scale-150" />
                  </Button>

                  {/* Edit form */}
                  <AddBartenderForm
                    isOpen={openEditForm}
                    onOpenChange={setOpenEditForm}
                    isEdit={true}
                    data={bartender}
                  />
                </div>
              </div>
            </div>

            {/* ── Basic Details ── */}
            <div className="w-full bg-white rounded-2xl p-5">
              <h1 className="section-heading border-b pb-5">Basic Details</h1>

              <div className="py-4 border-b">
                <p className="text-gray-500">Full Name</p>
                <p className="text-black font-medium text-lg">
                  {bartender.fullName || "—"}
                </p>
              </div>

              <div className="py-4 border-b">
                <p className="text-gray-500">Email Address</p>
                <p className="text-black font-medium text-lg">
                  {bartender.email || "—"}
                </p>
              </div>

              <div className="py-4 border-b">
                <p className="text-gray-500">Phone Number</p>
                <p className="text-black font-medium text-lg">
                  {formatPhoneNumber(bartender.phoneNumber) || "—"}
                </p>
              </div>

              <div className="py-4 border-b">
                <p className="text-gray-500">Address</p>
                <p className="text-black font-medium text-lg">
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
