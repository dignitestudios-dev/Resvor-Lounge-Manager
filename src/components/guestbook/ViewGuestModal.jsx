"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  Cake,
  User,
} from "lucide-react";
import utils from "@/lib/utils";

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

const ViewGuestModal = ({ isOpen, onOpenChange, guest, onEdit }) => {
  if (!guest) return null;

  const photoUrl =
    guest.photo?.location ||
    guest.photo?.url ||
    (typeof guest.photo === "string" ? guest.photo : null) ||
    guest.profileImage?.location ||
    guest.profileImage?.url ||
    (typeof guest.profileImage === "string" ? guest.profileImage : null);

  const displayName =
    guest.fullName ||
    `${guest.firstName || ""} ${guest.lastName || ""}`.trim() ||
    "Guest";

  const specialDates = parseSpecialDates(guest.specialDates);

  const birthMonthName = guest.birthMonth
    ? MONTHS_MAP[guest.birthMonth] || `Month ${guest.birthMonth}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto hidden-scrollbar p-6 rounded-2xl">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Guest Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Guest Profile Card */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-[#F5F5FF] to-[#EBEBFF] border border-[#E0E0FF]">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm">
                {(
                  guest.firstName?.[0] ||
                  guest.fullName?.[0] ||
                  "G"
                ).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {displayName}
              </h2>
              {guest.email && (
                <div className="flex items-center gap-1.5 text-gray-600 text-sm mt-1 truncate">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{guest.email}</span>
                </div>
              )}
              {guest.phoneNumber && (
                <div className="flex items-center gap-1.5 text-gray-600 text-sm mt-0.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{utils.formatPhoneNumber(guest.phoneNumber) || guest.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Birth Month */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <Cake className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Birth Month</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {birthMonthName || "Not specified"}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Added On</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {guest.createdAt ? utils.formatDateWithName(guest.createdAt) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Special Dates Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">
                Special Dates
              </h3>
            </div>

            {specialDates && specialDates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {specialDates.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 truncate">
                          {item.title || "Special Occasion"}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.date ? utils.formatDateWithName(item.date) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                No special dates recorded for this guest.
              </div>
            )}
          </div>

          {/* Details / Notes Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">
                Details & Notes
              </h3>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[70px]">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {guest.details || guest.notes || (
                  <span className="text-gray-400 italic">No notes or details added.</span>
                )}
              </p>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 rounded-xl text-sm"
            >
              Close
            </Button>
            {onEdit && (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onEdit(guest);
                }}
                className="h-11 px-6 rounded-xl text-sm font-medium"
              >
                Edit Guest
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewGuestModal;
