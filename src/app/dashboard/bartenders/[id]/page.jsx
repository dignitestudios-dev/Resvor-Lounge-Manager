"use client";
import AddBartenderForm from "@/components/bartender/AddBartenderForm";
import DeleteBartenderPopup from "@/components/bartender/DeleteBartenderPopup";
import AddGuestForm from "@/components/guestbook/AddGuestForm";
import Delete from "@/components/icons/Delete";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const BartenderDetails = () => {
  const router = useRouter();
  const params = useParams();
  const guestId = useMemo(() => params.id, [params]);
  console.log("guestId: ", guestId);

  // Modal triggers
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const handleDelete = () => {
    console.log("ID to delete: ", guestId);
    router.push("/dashboard/bartenders");
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <h1 className="section-heading">Bartender Details</h1>

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

                  {/* Add Bartender form to Edit,  */}
                  <AddBartenderForm
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
                <p className="text-gray-500">Address</p>
                <p className="text-black font-medium text-lg">
                  lorem ipsum dolor sit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Popup */}
      <DeleteBartenderPopup
        isOpen={openDeletePopup}
        onOpenChange={setOpenDeletePopup}
        onDelete={handleDelete}
      />
    </>
  );
};

export default BartenderDetails;
