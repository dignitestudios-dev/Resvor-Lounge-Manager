/* eslint-disable react/prop-types */

import { MdEdit, MdDelete } from "react-icons/md";
import AuthButton from "../auth/AuthButton";
import { useState, useEffect } from "react";
import axiosInstance from "../../axios";
import { deleteLounge } from "../../lib/hooks/api/Delete";
import DeleteLoungeModal from "../dashboard/DeleteLoungeModal";
import { ErrorToast, SuccessToast } from "../ui/toaster";

const MultipleLounge = ({
  handleNext,
  setCurrentStep,
  setCurrentState,
}) => {
  const [lounges, setLounges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loungeToDelete, setLoungeToDelete] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch lounges from API
  const fetchLounges = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/lounges/list");
      if (response.data.success && response.data.data) {
        setLounges(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching lounges:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLounges();
  }, []);

  const handleEdit = (lounge) => {
    console.log("Edit lounge:", lounge);
  };

  const handleDeleteClick = (lounge) => {
    setLoungeToDelete(lounge);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!loungeToDelete) return;
    try {
      setIsDeleting(true);
      await deleteLounge(loungeToDelete._id);
      SuccessToast("Lounge deleted successfully");
      setLounges((prev) => prev.filter((l) => l._id !== loungeToDelete._id));
      setIsDeleteOpen(false);
      setLoungeToDelete(null);
    } catch (err) {
      ErrorToast(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete lounge. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full max-w-[550px] mx-auto px-4">
        {/* Heading */}
        <div className="mt-4 text-center space-y-4 shrink-0">
          <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize leading-tight">
            Multiple Lounge <br />
            Account
          </p>

          <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]">
            Register your Lounge to start Booking online.
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="w-full mt-10 flex flex-col min-h-0">
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {/* Loading State */}
            {loading && (
              <div className="rounded-[20px] border-2 border-white/20 bg-white/5 backdrop-blur p-6 text-center text-white">
                <p>Loading lounges...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-[20px] border-2 border-red-500/50 bg-red-500/10 backdrop-blur p-6 text-center text-red-400">
                <p>Error: {error}</p>
              </div>
            )}

            {/* Lounge Cards */}
            {!loading && !error && lounges.length > 0 && (
              lounges.map((lounge) => (
                <div
                  key={lounge._id}
                  className="rounded-[20px] border-2 border-white/20 bg-white/5 backdrop-blur p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0">
                        <img
                          src={
                            lounge.logo?.location || "/images/dummyAvatar.png"
                          }
                          alt={lounge.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-white font-[600] text-lg truncate">
                          {lounge.name}
                        </p>

                        <p className="text-[#BEC2C9] text-sm break-all">
                          {lounge.businessEmail}
                        </p>

                        <p className="text-[#BEC2C9] text-sm">
                          {lounge.businessPhone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(lounge)}
                        className="p-2 hover:bg-white/10 rounded-lg transition cursor-pointer"
                      >
                        <MdEdit color="white" size={20} />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(lounge)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition cursor-pointer"
                        title={`Delete ${lounge.name}`}
                      >
                        <MdDelete color="#ef4444" size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <p className="text-[#BEC2C9] text-sm leading-relaxed">
                      <span className="text-white font-[500]">
                        {lounge.operatingHours?.open} -{" "}
                        {lounge.operatingHours?.close}
                      </span>{" "}
                      |{" "}
                      <span className="text-white font-[500]">
                        {lounge.specialization}
                      </span>
                    </p>

                    <p className="text-[#BEC2C9] text-sm break-words">
                      {lounge.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Fixed Bottom Button */}
          <div className="w-full mt-6 shrink-0">
            <AuthButton text={"Next"} onClick={handleNext} />
          </div>
        </div>
      </div>

      <DeleteLoungeModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setLoungeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loungeName={loungeToDelete?.name}
        isLoading={isDeleting}
      />
    </>
  );
};

export default MultipleLounge;
