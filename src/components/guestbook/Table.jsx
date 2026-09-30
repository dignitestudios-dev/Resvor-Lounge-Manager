"use client";
import React, { useState } from "react";
import utils from "@/lib/utils";
import { useRouter } from "next/navigation";
import Delete from "../icons/Delete";
import { Button } from "../ui/button";
import Edit from "../icons/Edit";
import { Eye } from "lucide-react";
import DeleteGuestPopup from "./DeleteGuestPopup";
import AddGuestForm from "./AddGuestForm";
import ViewGuestModal from "./ViewGuestModal";
import { useDeleteGuest } from "@/lib/hooks/mutations/GuestbookMutations";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import CustomPagination from "@/components/common/CustomPagination";

const Table = ({
  guests = [],
  isLoading = false,
  pagination = null,
  currentPage = 1,
  onPageChange = () => { },
}) => {
  const router = useRouter();
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedGuestForView, setSelectedGuestForView] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedGuestForEdit, setSelectedGuestForEdit] = useState(null);
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
      queryClient.invalidateQueries({ queryKey: ["guestbook-list"] });

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

  const handleViewGuest = (guest) => {
    setSelectedGuestForView(guest);
    setOpenViewModal(true);
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <>
      <CustomPagination
        loading={isLoading}
        onPageChange={onPageChange}
        totalPages={totalPages}
        currentPage={currentPage}
      >
        <div className="bg-white rounded-xl overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#E8E8FF]">
                <th
                  onClick={() => requestSort("fullName")}
                  className="px-4 py-5 text-left text-nowrap cursor-pointer"
                >
                  Guest Name
                </th>
                <th className="px-4 py-5 text-left text-nowrap">Email</th>
                <th className="px-4 py-5 text-left text-nowrap">Created Date</th>
                <th className="px-4 py-5 text-center text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {guests && guests?.length > 0 ? (
                guests?.map((guest) => (
                  <tr
                    key={guest._id}
                    className="border-b border-[#D4D4D4] cursor-pointer"
                  >
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const photoUrl =
                            guest.photo?.location ||
                            guest.photo?.url ||
                            (typeof guest.photo === "string" ? guest.photo : null) ||
                            guest.profileImage?.location ||
                            guest.profileImage?.url ||
                            (typeof guest.profileImage === "string"
                              ? guest.profileImage
                              : null);

                          const displayName =
                            guest.fullName ||
                            `${guest.firstName || ""} ${guest.lastName || ""}`.trim() ||
                            "Guest";

                          if (photoUrl) {
                            return (
                              <img
                                src={photoUrl}
                                alt={displayName}
                                className="h-[43px] w-[43px] rounded-full object-cover shrink-0 border border-gray-200"
                              />
                            );
                          }

                          return (
                            <div className="h-[43px] w-[43px] rounded-full bg-[#E8E8FF] text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                              {(
                                guest.firstName?.[0] ||
                                guest.fullName?.[0] ||
                                "G"
                              ).toUpperCase()}
                            </div>
                          );
                        })()}
                        <span className="font-medium text-gray-900">
                          {(() => {
                            const name =
                              guest.fullName ||
                              `${guest.firstName || ""} ${guest.lastName || ""}`.trim() ||
                              "Guest";
                            return name.length > 30 ? `${name.slice(0, 30)}...` : name;
                          })()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-6">{guest.email}</td>
                    <td className="px-4 py-6">
                      {utils.formatDateWithName(guest.createdAt)}
                    </td>
                    <td className="px-4 py-6 text-nowrap">
                      <div className="flex justify-center items-center cursor-pointer gap-1.5">
                        <Button
                          className="bg-[#ECECFF] hover:bg-[#DCDCFF] text-primary"
                          onClick={() => handleViewGuest(guest)}
                          title="View Guest Details"
                        >
                          <Eye className="w-5 h-5 text-primary" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteGuest(guest._id)}
                          className="bg-red-400 hover:bg-red-500"
                          title="Delete Guest"
                        >
                          <Delete className="scale-150 text-red-400" />
                        </Button>
                        <Button
                          className="bg-blue-100 hover:bg-blue-50"
                          onClick={() => handleEditGuest(guest)}
                          title="Edit Guest"
                        >
                          <Edit className="scale-150" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    Nothing here yet. Add a new guest to get started
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CustomPagination>

      {/* View Guest Modal */}
      <ViewGuestModal
        isOpen={openViewModal}
        onOpenChange={(isOpen) => {
          setOpenViewModal(isOpen);
          if (!isOpen) {
            setSelectedGuestForView(null);
          }
        }}
        guest={selectedGuestForView}
        onEdit={handleEditGuest}
      />

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
    </>
  );
};

export default Table;

