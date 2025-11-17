"use client";
import AddGuestForm from "@/components/guestbook/AddGuestForm";
import DeleteGuestPopup from "@/components/guestbook/DeleteGuestPopup";
import Delete from "@/components/icons/Delete";
import Edit2 from "@/components/icons/Edit2";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const GuestDetails = () => {
  const router = useRouter();
  const params = useParams();
  const guestId = useMemo(() => params.id, [params]);
  console.log("guestId: ", guestId);

  // Modal triggers
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const handleDelete = () => {
    console.log("ID to delete: ", guestId);
    router.push("/dashboard/guestbook");
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <h1 className="section-heading">Guest Details</h1>

        <div className="mt-10 flex-1 bg-white rounded-2xl p-5 overflow-y-auto">
          <div className="flex flex-col bg-[#F5F5F5] rounded-2xl h-full p-5 space-y-5 overflow-y-auto">
            <div className="w-full bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  <div
                    className="w-28 h-28 rounded-full bg-center bg-cover"
                    style={{
                      backgroundImage: `url(/images/profile.png)`,
                    }}
                  />

                  <div>
                    <p className="text-black text-3xl! font-bold">John Alex</p>
                    <p className="text-gray-500">john.alex@gmail.com</p>
                  </div>
                </div>
                <div className="space-x-5">
                  <Button
                    className={"bg-red-400 hover:bg-red-500 w-14! h-14!"}
                    onClick={() => setOpenDeletePopup(true)}
                  >
                    <Delete className="scale-150" />
                  </Button>

                  {/* Add Guest form to Edit,  */}
                  <AddGuestForm
                    isOpen={openEditForm}
                    onOpenChange={setOpenEditForm}
                    isEdit={true}
                    data={{}}
                  />
                </div>
              </div>
            </div>

            <div className="w-full bg-white rounded-2xl p-5 overflow-y-auto">
              <h1 className="section-heading border-b pb-5">Basic Details</h1>

              <div className="py-4 border-b">
                <p className="text-gray-500">Full Name</p>
                <p className="text-black font-medium text-lg">John Alex</p>
              </div>

              <div className="py-4 border-b">
                <p className="text-gray-500">Email Address</p>
                <p className="text-black font-medium text-lg">
                  johndoe@gmail.com
                </p>
              </div>

              <div className="py-4 border-b">
                <p className="text-gray-500">Phone Number</p>
                <p className="text-black font-medium text-lg">+000 0000 000</p>
              </div>

              <div className="py-4 border-b">
                <p className="text-gray-500">Birthday</p>
                <p className="text-black font-medium text-lg">Jan 02, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Popup */}
      <DeleteGuestPopup
        isOpen={openDeletePopup}
        onOpenChange={setOpenDeletePopup}
        onDelete={handleDelete}
      />
    </>
  );
};

export default GuestDetails;
