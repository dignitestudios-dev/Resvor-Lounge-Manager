"use client";
import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import utils from "@/lib/utils";
import { useRouter } from "next/navigation";
import Delete from "../icons/Delete";
import { Button } from "../ui/button";
import Edit from "../icons/Edit";
import DeleteGuestPopup from "./DeleteGuestPopup";
import AddGuestForm from "./AddGuestForm";
import { useDeleteGuest } from "@/lib/hooks/mutations/GuestbookMutations";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const Table = ({ guests = [], isLoading = false }) => {
  const router = useRouter();
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedGuestForEdit, setSelectedGuestForEdit] = useState(null);
  console.log("🚀 ~ Table ~ selectedGuestForEdit:", selectedGuestForEdit);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedGuestIdForDelete, setSelectedGuestIdForDelete] =
    useState(null);

  // Mutations and Query Client
  const deleteGuestMutation = useDeleteGuest();
  const queryClient = useQueryClient();

  const [sortConfig, setSortConfig] = useState({
    key: "fullName",
    direction: "asc",
  });

  const handleGoToGuestDetailsPage = (guestId) => {
    router.push(`/dashboard/guestbook/${guestId}`);
  };

  const sortedGuests = [...guests].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    // Convert qty to number for numeric sorting
    if (sortConfig.key === "qty") {
      valA = parseInt(valA, 10);
      valB = parseInt(valB, 10);
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async () => {
    try {
      if (!selectedGuestIdForDelete) {
        ErrorToast("Guest ID not found");
        return;
      }

      await deleteGuestMutation.mutateAsync(selectedGuestIdForDelete);

      // Invalidate the guestbook list query to refresh data
      queryClient.invalidateQueries(["guestbook-list"]);

      SuccessToast("Guest deleted successfully");

      // Reset state
      setOpenDeletePopup(false);
      setSelectedGuestIdForDelete(null);
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete guest. Please try again.",
      );
      console.log("Delete guest error:", error);
    }
  };

  const handleDeleteGuest = (guestId) => {
    setSelectedGuestIdForDelete(guestId);
    setOpenDeletePopup(true);
  };

  const handleEditGuest = (guest) => {
    setSelectedGuestForEdit(guest);
    setOpenEditForm(true);
  };

  return (
    <div className="bg-white rounded-xl overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading guests...</p>
        </div>
      ) : guests && guests.length > 0 ? (
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th
                onClick={() => requestSort("fullName")}
                className="px-4 py-5 text-left text-nowrap cursor-pointer"
              >
                Guest Name
                {sortConfig.key === "fullName" ? (
                  sortConfig.direction === "asc" ? (
                    <span className="cursor-pointer">↑</span>
                  ) : (
                    <span className="cursor-pointer">↓</span>
                  )
                ) : (
                  ""
                )}
              </th>
              <th className="px-4 py-5 text-left text-nowrap">Email</th>
              <th className="px-4 py-5 text-left text-nowrap">Created Date</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedGuests.map((guest) => (
              <tr
                key={guest._id}
                className="border-b border-[#D4D4D4] cursor-pointer"
              >
                <td className="px-4 py-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-primary"
                      style={{
                        backgroundImage: `url(${"/images/profile.png"})`,
                      }}
                    />
                    {guest.fullName}{" "}
                  </div>
                </td>
                <td className="px-4 py-6">{guest.email}</td>
                <td className="px-4 py-6">
                  {utils.formatDateWithName(guest.createdAt)}
                </td>
                <td className="px-4 py-6 text-nowrap">
                  <div className="flex justify-center items-center cursor-pointer gap-1">
                    {/* <IoIosArrowForward size={24} /> */}

                    <Button
                      onClick={() => handleDeleteGuest(guest._id)}
                      className="bg-red-400 hover:bg-red-500"
                    >
                      <Delete className="scale-150 text-red-400" />
                    </Button>
                    <Button
                      className="bg-blue-100 hover:bg-blue-50"
                      onClick={() => handleEditGuest(guest)}
                    >
                      <Edit className="scale-150 " />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">No guests found</p>
        </div>
      )}
      {/* Delete Popup */}
      <DeleteGuestPopup
        isOpen={openDeletePopup}
        onOpenChange={setOpenDeletePopup}
        onDelete={handleDelete}
      />
      {/* Edit Guest Form */}
      <AddGuestForm
        isOpen={openEditForm}
        onOpenChange={(isOpen) => {
          setOpenEditForm(isOpen);
          if (!isOpen) {
            setSelectedGuestForEdit(null);
          }
        }}
        data={selectedGuestForEdit}
        isEdit={true}
        showTrigger={false}
      />
    </div>
  );
};

export default Table;
