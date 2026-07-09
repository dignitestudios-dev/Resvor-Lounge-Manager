"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { useGetBartenders } from "@/lib/hooks/queries/useBartenders";
import { useDeleteBartender } from "@/lib/hooks/mutations/BartenderMutations";
import DeleteBartenderPopup from "./DeleteBartenderPopup";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import CustomPagination from "@/components/common/CustomPagination";

const LIMIT = 10;

const Table = () => {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "fullName",
    direction: "asc",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: response, isLoading, isError } = useGetBartenders({
    page,
    limit: LIMIT,
  });
  const { mutate: deleteBartender, isPending: isDeleting } = useDeleteBartender();

  const bartenders = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;

  const handleGoToDetailsPage = (id) => {
    router.push(`/dashboard/bartenders/${id}`);
  };

  const sortedBartenders = [...bartenders].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key] || "";
    let valB = b[sortConfig.key] || "";
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

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteBartender(deleteTarget._id, {
      onSuccess: () => {
        SuccessToast("Bartender deleted successfully.");
        setDeleteTarget(null);
      },
      onError: (error) => {
        ErrorToast(
          error?.response?.data?.message || "Failed to delete bartender."
        );
        setDeleteTarget(null);
      },
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <>
      <CustomPagination
        loading={isLoading}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      >
        {isError ? (
          <div className="flex justify-center items-center py-20 text-red-500">
            Failed to load bartenders. Please try again.
          </div>
        ) : !isLoading && bartenders.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            No bartenders found.
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#E8E8FF]">
                <th
                  onClick={() => requestSort("fullName")}
                  className="px-4 py-5 text-left text-nowrap cursor-pointer select-none"
                >
                  Name
                  {sortConfig.key === "fullName" ? (
                    sortConfig.direction === "asc" ? (
                      <span> ↑</span>
                    ) : (
                      <span> ↓</span>
                    )
                  ) : null}
                </th>
                <th className="px-4 py-5 text-left text-nowrap">
                  Email Address
                </th>
                <th className="px-4 py-5 text-left text-nowrap">Number</th>
                <th className="px-4 py-5 text-left text-nowrap">Address</th>
                <th className="px-4 py-5 text-center text-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedBartenders.map((bartender, index) => (
                <tr
                  key={bartender._id || index}
                  className="border-b border-[#D4D4D4] hover:bg-gray-50 transition-colors"
                >
                  {/* Name */}
                  <td
                    className="px-4 py-6 cursor-pointer"
                    onClick={() => handleGoToDetailsPage(bartender._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-primary flex-shrink-0"
                        style={{
                          backgroundImage: bartender.profileImage?.location
                            ? `url(${bartender.profileImage.location})`
                            : `url(/images/profile.png)`,
                        }}
                      />
                      {bartender.fullName}
                    </div>
                  </td>

                  {/* Email */}
                  <td
                    className="px-4 py-6 cursor-pointer"
                    onClick={() => handleGoToDetailsPage(bartender._id)}
                  >
                    {bartender.email}
                  </td>

                  {/* Phone */}
                  <td
                    className="px-4 py-6 cursor-pointer"
                    onClick={() => handleGoToDetailsPage(bartender._id)}
                  >
                    {bartender.phoneNumber}
                  </td>

                  {/* Address */}
                  <td
                    className="px-4 py-6 cursor-pointer"
                    onClick={() => handleGoToDetailsPage(bartender._id)}
                  >
                    {bartender.address}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-6 text-nowrap">
                    <div
                      className="flex justify-center items-center cursor-pointer"
                      onClick={() => handleGoToDetailsPage(bartender._id)}
                    >
                      <IoIosArrowForward size={24} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CustomPagination>

      {/* Delete Confirmation Popup */}
      <DeleteBartenderPopup
        isOpen={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default Table;
