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
  Building2,
  Briefcase,
  Globe,
  ExternalLink,
  MapPin,
  Share2,
  AtSign,
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

  const addr = guest.address || {};
  const social = guest.socialNetwork || {};

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto hidden-scrollbar p-6 rounded-2xl">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Guest Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Guest Profile Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#F5F5FF] to-[#EBEBFF] border border-[#E0E0FF]">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className="w-18 h-18 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-18 h-18 rounded-full bg-primary text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm">
                {(
                  guest.firstName?.[0] ||
                  guest.fullName?.[0] ||
                  "G"
                ).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  {displayName}
                </h2>
                {guest.nickname && (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                    &quot;{guest.nickname}&quot;
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-gray-600 text-sm mt-1 truncate">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{guest.email || "N/A"}</span>
              </div>

              <div className="flex items-center gap-1.5 text-gray-600 text-sm mt-0.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {guest.phoneNumber
                    ? utils.formatPhoneNumber(guest.phoneNumber) || guest.phoneNumber
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Basic & Professional Information */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">
                Basic & Professional Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">First Name</span>
                <span className="font-semibold text-gray-900 break-words">
                  {guest.firstName || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Last Name</span>
                <span className="font-semibold text-gray-900 break-words">
                  {guest.lastName || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Nickname</span>
                <span className="font-semibold text-gray-900 break-words">
                  {guest.nickname || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Birth Month</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                  <Cake className="w-4 h-4 text-pink-500 shrink-0" />
                  {birthMonthName || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Company</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5 break-words">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  {guest.company || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Title / Position</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5 break-words">
                  <Briefcase className="w-4 h-4 text-primary shrink-0" />
                  {guest.title || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 sm:col-span-2">
                <span className="text-xs text-gray-500 font-medium block">Website</span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  {renderUrlLink(guest.website)}
                </div>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">
                Address Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 sm:col-span-2">
                <span className="text-xs text-gray-500 font-medium block">Street Address</span>
                <span className="font-semibold text-gray-900 break-words">
                  {addr.street || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">City</span>
                <span className="font-semibold text-gray-900 break-words">
                  {addr.city || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">State</span>
                <span className="font-semibold text-gray-900 break-words">
                  {addr.state || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">ZIP Code</span>
                <span className="font-semibold text-gray-900 break-words">
                  {addr.zip || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Country</span>
                <span className="font-semibold text-gray-900 break-words">
                  {addr.country || "United States"}
                </span>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">
                Social Profiles
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Facebook</span>
                <div className="mt-0.5 truncate">{renderUrlLink(social.facebook, "Facebook Profile")}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Twitter / X</span>
                <div className="mt-0.5 truncate">{renderUrlLink(social.twitter, "Twitter/X Profile")}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">LinkedIn</span>
                <div className="mt-0.5 truncate">{renderUrlLink(social.linkedin, "LinkedIn Profile")}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium block">Instagram</span>
                <div className="mt-0.5 truncate">{renderUrlLink(social.instagram, "Instagram Profile")}</div>
              </div>
            </div>
          </div>

          {/* Special Dates Section */}
          <div className="space-y-2.5">
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
                    className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-2.5 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 truncate">
                        {item.title || "N/A"}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
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

          {/* Details / Notes Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">
                Details & Notes
              </h3>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 min-h-[60px]">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {guest.details || guest.notes || (
                  <span className="text-gray-400">N/A</span>
                )}
              </p>
            </div>
          </div>

          {/* Added On Date */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Added to Guestbook
            </span>
            <span className="font-semibold text-gray-700">
              {guest.createdAt ? utils.formatDateWithName(guest.createdAt) : "N/A"}
            </span>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 rounded-xl text-sm cursor-pointer"
            >
              Close
            </Button>
            {onEdit && (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onEdit(guest);
                }}
                className="h-11 px-6 rounded-xl text-sm font-medium cursor-pointer"
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
