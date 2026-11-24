"use client";
import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AddGuestForm from "@/components/guestbook/AddGuestForm";
import DeleteGuestPopup from "@/components/guestbook/DeleteGuestPopup";
import Delete from "@/components/icons/Delete";
import Edit2 from "@/components/icons/Edit2";
import { Button } from "@/components/ui/button";
import { useGetGuestById } from "@/lib/hooks/queries/useGuestbook";
import { useDeleteGuest } from "@/lib/hooks/mutations/GuestbookMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import PageLoader from "@/components/common/PageLoader";
import utils from "@/lib/utils";
import {
  Mail,
  Phone,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  Cake,
  User,
  Building2,
  Briefcase,
  Globe,
  ExternalLink,
  MapPin,
  Share2,
  ArrowLeft,
} from "lucide-react";

const MONTHS_MAP = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

const parseSpecialDates = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const renderUrlLink = (url, label) => {
  if (!url || typeof url !== "string" || !url.trim()) {
    return <span className="text-gray-400 font-normal">N/A</span>;
  }
  const clean = url.trim();
  const href = clean.startsWith("http://") || clean.startsWith("https://")
    ? clean
    : `https://${clean}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline inline-flex items-center gap-1 font-medium truncate max-w-full"
      title={clean}
    >
      <span className="truncate">{label || clean}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
    </a>
  );
};

const GuestDetails = () => {
  const router = useRouter();
  const params = useParams();
  const guestId = useMemo(() => params?.id, [params]);

  // Modal triggers
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const { data: guest, isLoading } = useGetGuestById(guestId);
  const deleteGuestMutation = useDeleteGuest();

  const handleDelete = async () => {
    try {
      if (guestId) {
        await deleteGuestMutation.mutateAsync(guestId);
        SuccessToast("Guest deleted successfully");
      }
      router.push("/dashboard/guestbook");
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete guest. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  const photoUrl =
    guest?.photo?.location ||
    guest?.photo?.url ||
    (typeof guest?.photo === "string" ? guest.photo : null) ||
    guest?.profileImage?.location ||
    guest?.profileImage?.url ||
    (typeof guest?.profileImage === "string" ? guest.profileImage : null);

  const displayName =
    guest?.fullName ||
    `${guest?.firstName || ""} ${guest?.lastName || ""}`.trim() ||
    "Guest";

  const specialDates = parseSpecialDates(guest?.specialDates);

  const birthMonthName = guest?.birthMonth
    ? MONTHS_MAP[guest.birthMonth] || `Month ${guest.birthMonth}`
    : null;

  const addr = guest?.address || {};
  const social = guest?.socialNetwork || {};

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/guestbook")}
            className="h-10 w-10 rounded-full hover:bg-gray-100 cursor-pointer"
            title="Back to Guestbook"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <h1 className="section-heading">Guest Details</h1>
        </div>

        <div className="mt-6 flex-1 bg-white rounded-2xl p-5 overflow-y-auto">
          <div className="flex flex-col bg-[#F5F5F5] rounded-2xl h-full p-5 space-y-5 overflow-y-auto">
            {/* Header Card */}
            <div className="w-full bg-white rounded-2xl p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-5 min-w-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="w-24 h-24 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary text-white font-bold text-3xl flex items-center justify-center shrink-0 shadow-sm">
                      {(
                        guest?.firstName?.[0] ||
                        guest?.fullName?.[0] ||
                        "G"
                      ).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-black text-2xl sm:text-3xl font-bold truncate">
                        {displayName}
                      </p>
                      {guest?.nickname && (
                        <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                          &quot;{guest.nickname}&quot;
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1 truncate">
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{guest?.email || "N/A"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        {guest?.phoneNumber
                          ? utils.formatPhoneNumber(guest.phoneNumber) || guest.phoneNumber
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    className="bg-red-400 hover:bg-red-500 w-12 h-12 rounded-xl cursor-pointer"
                    onClick={() => setOpenDeletePopup(true)}
                    title="Delete Guest"
                  >
                    <Delete className="scale-125" />
                  </Button>

                  <Button
                    className="bg-primary hover:bg-primary/90 w-12 h-12 rounded-xl cursor-pointer"
                    onClick={() => setOpenEditForm(true)}
                    title="Edit Guest"
                  >
                    <Edit2 className="scale-125 text-white" />
                  </Button>

                  {/* Add Guest form to Edit */}
                  <AddGuestForm
                    isOpen={openEditForm}
                    onOpenChange={setOpenEditForm}
                    isEdit={true}
                    data={guest || {}}
                    showTrigger={false}
                  />
                </div>
              </div>
            </div>

            {/* Basic & Professional Details */}
            <div className="w-full bg-white rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">
                  Basic & Professional Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">First Name</p>
                  <p className="text-black font-semibold text-base mt-0.5 break-words">
                    {guest?.firstName || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Last Name</p>
                  <p className="text-black font-semibold text-base mt-0.5 break-words">
                    {guest?.lastName || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Nickname</p>
                  <p className="text-black font-semibold text-base mt-0.5 break-words">
                    {guest?.nickname || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Birth Month</p>
                  <p className="text-black font-semibold text-base mt-0.5 flex items-center gap-1.5">
                    <Cake className="w-4 h-4 text-pink-500 shrink-0" />
                    {birthMonthName || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Company</p>
                  <p className="text-black font-semibold text-base mt-0.5 flex items-center gap-1.5 break-words">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    {guest?.company || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Title / Position</p>
                  <p className="text-black font-semibold text-base mt-0.5 flex items-center gap-1.5 break-words">
                    <Briefcase className="w-4 h-4 text-primary shrink-0" />
                    {guest?.title || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2 lg:col-span-3">
                  <p className="text-xs text-gray-500 font-medium">Website</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-primary shrink-0" />
                    {renderUrlLink(guest?.website)}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="w-full bg-white rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Address Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2 lg:col-span-3">
                  <p className="text-xs text-gray-500 font-medium">Street Address</p>
                  <p className="text-black font-semibold text-base mt-0.5 break-words">
                    {addr.street || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">City</p>
                  <p className="text-black font-semibold text-base mt-0.5 break-words">
                    {addr.city || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">State</p>
                  <p className="text-black font-semibold text-base mt-0.5 break-words">
                    {addr.state || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">ZIP Code</p>
                  <p className="text-black font-semibold text-base mt-0.5 break-words">
                    {addr.zip || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Country</p>
                  <p className="text-black font-semibold text-base mt-0.5 break-words">
                    {addr.country || "United States"}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Profiles */}
            <div className="w-full bg-white rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <Share2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Social Profiles</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Facebook</p>
                  <div className="mt-1 truncate">
                    {renderUrlLink(social.facebook, "Facebook Profile")}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Twitter / X</p>
                  <div className="mt-1 truncate">
                    {renderUrlLink(social.twitter, "Twitter/X Profile")}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">LinkedIn</p>
                  <div className="mt-1 truncate">
                    {renderUrlLink(social.linkedin, "LinkedIn Profile")}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Instagram</p>
                  <div className="mt-1 truncate">
                    {renderUrlLink(social.instagram, "Instagram Profile")}
                  </div>
                </div>
              </div>
            </div>

            {/* Special Dates */}
            <div className="w-full bg-white rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Special Dates</h2>
              </div>

              {specialDates && specialDates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {specialDates.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 font-medium truncate">
                          {item.title || "N/A"}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">
                          {item.date ? utils.formatDateWithName(item.date) || item.date : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-400">
                  N/A
                </div>
              )}
            </div>

            {/* Details / Notes */}
            <div className="w-full bg-white rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Details & Notes</h2>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[70px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {guest?.details || guest?.notes || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </p>
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
