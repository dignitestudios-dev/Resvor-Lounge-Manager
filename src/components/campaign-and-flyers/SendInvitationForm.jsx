"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Plus,
  Loader2,
  Check,
  Mail,
  Phone,
  Smartphone,
  ArrowLeft,
  Search,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useGetGuestbook } from "@/lib/hooks/queries/useGuestbook";
import { useCreateCampaign } from "@/lib/hooks/mutations/CampaignMutations";
import { useGetMySubscription } from "@/lib/hooks/queries/useSubscriptionPlans";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import { phoneFormatter } from "@/lib/utils";
import FlyerLimitModal from "./FlyerLimitModal";

// Strict email regex
const emailRegex =
  /^(?!.*\.\.)(?!.*\.$)[A-Za-z0-9][A-Za-z0-9._+-]*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Helper to normalize phone numbers to E.164 (+1XXXXXXXXXX)
const normalizePhone = (input) => {
  if (!input) return "";
  const trimmed = String(input).trim();
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return `+${digits}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length > 10) {
    return `+${digits}`;
  }
  return digits ? `+1${digits}` : "";
};

// Validate phone digits length
const isValidPhone = (input) => {
  if (!input) return false;
  const digits = String(input).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

// Helper to format phone for tag/chip display
const formatPhoneTag = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return phoneFormatter(digits.slice(1));
  }
  if (digits.length === 10) {
    return phoneFormatter(digits);
  }
  return phone;
};

const SendInvitationForm = ({
  isOpen,
  onOpenChange,
  onSendInvitation,
  image,
  additionalInfo,
}) => {
  // Step 1: "channel", Step 2: "recipients"
  const [step, setStep] = useState("channel");
  const [selectedChannel, setSelectedChannel] = useState("email"); // "email" | "sms"

  // Recipients per channel so switching channel does not lose data
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [phoneRecipients, setPhoneRecipients] = useState([]);

  // Inputs
  const [customEmail, setCustomEmail] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [searchGuestQuery, setSearchGuestQuery] = useState("");

  const [showLimitModal, setShowLimitModal] = useState(false);

  // Reset to channel step whenever dialog is opened
  useEffect(() => {
    if (isOpen) {
      setStep("channel");
      setSearchGuestQuery("");
    }
  }, [isOpen]);

  // Fetch all guests from guestbook API
  const { data: guestbookData, isLoading: isGuestsLoading } = useGetGuestbook({
    page: 1,
    limit: 100,
  });
  const guests = guestbookData?.data || [];

  // Fetch subscription data
  const { data: subscriptionData } = useGetMySubscription();

  // Campaign mutation
  const createCampaignMutation = useCreateCampaign();

  // Extract flyer limits from subscription
  const subscription = subscriptionData?.subscription;
  const flyerLimit = subscription?.planId?.limitations?.flyers ?? Infinity;
  const flyerUsage = subscription?.usage?.flyers ?? 0;
  const planLabel = subscription?.planId?.label || "Current";
  const isAtFlyerLimit = flyerUsage >= flyerLimit;

  // Active recipients depending on channel
  const activeRecipients =
    selectedChannel === "sms" ? phoneRecipients : emailRecipients;

  // ─── Email Management ─────────────────────────────────────
  const addEmail = () => {
    const raw = customEmail.trim();
    if (!raw) return;

    // Support comma, semicolon, space, or newline separated batch emails
    const emails = raw
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) return;

    let addedCount = 0;
    const nextList = [...emailRecipients];

    for (const email of emails) {
      if (email.startsWith(" ")) {
        ErrorToast("Email cannot start with a space.");
        return;
      }
      if (/\s/.test(email)) {
        ErrorToast("Email cannot contain spaces.");
        return;
      }
      if (!emailRegex.test(email)) {
        ErrorToast(`Invalid email format: ${email}`);
        return;
      }
      if (!nextList.includes(email)) {
        nextList.push(email);
        addedCount++;
      }
    }

    if (addedCount === 0 && emails.length > 0) {
      ErrorToast("Email(s) already added.");
    } else {
      setEmailRecipients(nextList);
      setCustomEmail("");
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const handleRemoveEmail = (email) => {
    setEmailRecipients(emailRecipients.filter((e) => e !== email));
  };

  const handleToggleGuestEmail = (email) => {
    if (!email) return;
    if (emailRecipients.includes(email)) {
      setEmailRecipients(emailRecipients.filter((e) => e !== email));
    } else {
      setEmailRecipients([email, ...emailRecipients]);
    }
  };

  // ─── Phone Management ─────────────────────────────────────
  const handlePhoneInputChange = (e) => {
    const raw = e.target.value;
    // Format numeric input progressively
    const formatted = phoneFormatter(raw);
    setCustomPhone(formatted);
  };

  const addPhone = () => {
    const raw = customPhone.trim();
    if (!raw) return;

    // Support comma, semicolon, or newline separated batch phone numbers
    const phones = raw
      .split(/[\n,;]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (phones.length === 0) return;

    let addedCount = 0;
    const nextList = [...phoneRecipients];

    for (const phone of phones) {
      if (!isValidPhone(phone)) {
        ErrorToast(`Please enter a valid 10-digit phone number: ${phone}`);
        return;
      }
      const normalized = normalizePhone(phone);
      if (!nextList.includes(normalized)) {
        nextList.push(normalized);
        addedCount++;
      }
    }

    if (addedCount === 0 && phones.length > 0) {
      ErrorToast("Phone number(s) already added.");
    } else {
      setPhoneRecipients(nextList);
      setCustomPhone("");
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPhone();
    }
  };

  const handleRemovePhone = (phone) => {
    setPhoneRecipients(phoneRecipients.filter((p) => p !== phone));
  };

  const handleToggleGuestPhone = (phone) => {
    if (!phone) return;
    const normalized = normalizePhone(phone);
    if (!normalized) return;
    if (phoneRecipients.includes(normalized)) {
      setPhoneRecipients(phoneRecipients.filter((p) => p !== normalized));
    } else {
      setPhoneRecipients([normalized, ...phoneRecipients]);
    }
  };

  // ─── Filtered Guests ──────────────────────────────────────
  const filteredGuests = useMemo(() => {
    if (!guests || !Array.isArray(guests)) return [];
    if (!searchGuestQuery.trim()) return guests;
    const q = searchGuestQuery.toLowerCase().trim();
    return guests.filter((g) => {
      const name = (g.fullName || `${g.firstName || ""} ${g.lastName || ""}`).toLowerCase();
      const email = (g.email || "").toLowerCase();
      const phone = (g.phoneNumber || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [guests, searchGuestQuery]);

  // ─── Limit Modal Handlers ─────────────────────────────────
  const openLimitModal = () => {
    onOpenChange(false);
    setShowLimitModal(true);
  };

  const handleLimitAccept = () => {
    setShowLimitModal(false);
    onOpenChange(true);
    handleSend(true);
  };

  const handleLimitClose = () => {
    setShowLimitModal(false);
    onOpenChange(true);
  };

  // ─── Send Campaign Mutation ───────────────────────────────
  const handleSend = async (bypassLimit = false) => {
    const shouldBypass = bypassLimit === true;

    if (activeRecipients.length === 0) {
      ErrorToast(
        selectedChannel === "sms"
          ? "Please select or enter at least one phone number recipient."
          : "Please select or enter at least one email recipient."
      );
      return;
    }

    if (!image) {
      ErrorToast("No flyer designed or uploaded yet.");
      return;
    }

    if (isAtFlyerLimit && !shouldBypass) {
      openLimitModal();
      return;
    }

    try {
      await createCampaignMutation.mutateAsync({
        channel: selectedChannel,
        recipients: activeRecipients,
        additionalInfo: additionalInfo || "",
        image: image,
      });

      SuccessToast("Flyer campaign created successfully");
      setEmailRecipients([]);
      setPhoneRecipients([]);
      setCustomEmail("");
      setCustomPhone("");
      setStep("channel");
      if (onSendInvitation) {
        onSendInvitation(selectedChannel);
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.message || "";
      if (apiMessage.toLowerCase().includes("insufficient wallet balance")) {
        ErrorToast(apiMessage || "Insufficient wallet balance");
      } else {
        ErrorToast(apiMessage || "Failed to create flyer campaign");
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-lg rounded-2xl p-6 sm:p-7"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {step === "channel" ? (
            /* ─────────────────────────────────────────────────────────
               STEP 1: CHOOSE INVITATION CHANNEL
               ───────────────────────────────────────────────────────── */
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Send Invitation
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Choose how you would like to send this invitation to your guests:
                </p>
              </DialogHeader>

              <div className="mt-6 space-y-3.5">
                {/* Email Option Card */}
                <div
                  onClick={() => setSelectedChannel("email")}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedChannel === "email"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                        selectedChannel === "email"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Email Address
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Send flyer invitations directly to guests&apos; email inboxes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center pl-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedChannel === "email"
                          ? "border-primary bg-primary"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedChannel === "email" && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone Number Option Card */}
                <div
                  onClick={() => setSelectedChannel("sms")}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedChannel === "sms"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                        selectedChannel === "sms"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Phone Number (SMS)
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Send flyer text invitations directly to guests&apos; mobile phones
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center pl-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedChannel === "sms"
                          ? "border-primary bg-primary"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedChannel === "sms" && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12 text-sm font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep("recipients")}
                  className="flex-1 h-12 text-sm font-medium bg-primary text-white hover:bg-primary/95 flex items-center justify-center gap-1.5"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────
               STEP 2: ADD RECIPIENTS & SELECT GUESTS
               ───────────────────────────────────────────────────────── */
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between mb-1">
                  <button
                    type="button"
                    onClick={() => setStep("channel")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change Channel
                  </button>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {selectedChannel === "sms" ? (
                      <>
                        <Smartphone className="w-3.5 h-3.5" /> Phone Number (SMS)
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" /> Email
                      </>
                    )}
                  </span>
                </div>

                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {selectedChannel === "sms"
                    ? "Add Phone Recipients"
                    : "Add Email Recipients"}
                </DialogTitle>
                <DialogDescription asChild>
                  <p className="text-xs text-gray-500">
                    {selectedChannel === "sms"
                      ? "Add phone numbers or choose from your guestbook to receive SMS flyer invitations."
                      : "Add email addresses or choose from your guestbook to receive flyer invitations."}
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* ── Direct Input Section ── */}
                {selectedChannel === "email" ? (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium text-black">
                      Recipient Email
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter email (e.g. guest@example.com)"
                        className="h-12 flex-1 text-sm"
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        onKeyDown={handleEmailKeyDown}
                      />
                      <Button
                        type="button"
                        onClick={addEmail}
                        className="h-12 px-4 bg-primary text-white hover:bg-primary/90"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Type an email and press Enter or &quot;+&quot; to add. You can also paste comma-separated emails.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium text-black">
                      Recipient Phone Number
                    </Label>
                    <div className="flex gap-2">
                      {/* Formatted Phone Input with US flag */}
                      <div className="flex-1 flex items-center h-12 px-3 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                        <img
                          src="https://flagcdn.com/w320/us.png"
                          alt="US"
                          className="w-5 h-3.5 rounded-xs object-cover mr-1.5"
                        />
                        <span className="text-xs font-medium text-gray-600 mr-2">
                          +1
                        </span>
                        <div className="h-4 border-l border-gray-300 mr-2" />
                        <input
                          type="text"
                          value={customPhone}
                          onChange={handlePhoneInputChange}
                          onKeyDown={handlePhoneKeyDown}
                          maxLength={14}
                          placeholder="(555) 000-0000"
                          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={addPhone}
                        className="h-12 px-4 bg-primary text-white hover:bg-primary/90"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Type a 10-digit number and press Enter or &quot;+&quot; to add. You can also paste comma-separated numbers.
                    </p>
                  </div>
                )}

                {/* ── Selected Recipients Chips ── */}
                {activeRecipients.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>
                        Selected Recipients ({activeRecipients.length})
                      </span>
                      {activeRecipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedChannel === "sms") {
                              setPhoneRecipients([]);
                            } else {
                              setEmailRecipients([]);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-normal cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="border rounded-xl p-2.5 max-h-24 overflow-y-auto flex flex-wrap gap-1.5 bg-gray-50/50">
                      {activeRecipients.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-xs shadow-xs"
                        >
                          <span className="text-gray-800 font-medium truncate max-w-[190px]">
                            {selectedChannel === "sms"
                              ? formatPhoneTag(rec)
                              : rec}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              selectedChannel === "sms"
                                ? handleRemovePhone(rec)
                                : handleRemoveEmail(rec)
                            }
                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Guestbook Selection ── */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-black">
                      Select from Guestbook
                    </Label>
                    <span className="text-xs text-gray-500">
                      {filteredGuests.length} guest{filteredGuests.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Search Guests */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search guests by name or details..."
                      value={searchGuestQuery}
                      onChange={(e) => setSearchGuestQuery(e.target.value)}
                      className="h-10 pl-9 text-xs"
                    />
                  </div>

                  {/* Guests List */}
                  <div className="border rounded-xl p-2.5 max-h-[190px] overflow-y-auto divide-y divide-gray-100">
                    {isGuestsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : filteredGuests && filteredGuests.length > 0 ? (
                      filteredGuests.map((guest) => {
                        const guestName =
                          guest.fullName ||
                          `${guest.firstName || ""} ${guest.lastName || ""}`.trim() ||
                          "Guest";

                        if (selectedChannel === "sms") {
                          const hasPhone = !!guest.phoneNumber?.trim();
                          const normPhone = hasPhone
                            ? normalizePhone(guest.phoneNumber)
                            : "";
                          const isSelected =
                            hasPhone && phoneRecipients.includes(normPhone);

                          return (
                            <div
                              key={guest._id}
                              onClick={() => {
                                if (hasPhone) {
                                  handleToggleGuestPhone(guest.phoneNumber);
                                }
                              }}
                              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                                !hasPhone
                                  ? "opacity-50 cursor-not-allowed bg-transparent"
                                  : isSelected
                                  ? "bg-primary/8 border border-primary/20 cursor-pointer"
                                  : "hover:bg-gray-50 border border-transparent cursor-pointer"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs shrink-0 font-medium text-gray-700">
                                {guestName.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {guestName}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">
                                  {hasPhone ? (
                                    phoneFormatter(guest.phoneNumber)
                                  ) : (
                                    <span className="italic text-gray-400">
                                      No phone number on file
                                    </span>
                                  )}
                                </p>
                              </div>

                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          // Email channel
                          const hasEmail = !!guest.email?.trim();
                          const isSelected =
                            hasEmail && emailRecipients.includes(guest.email);

                          return (
                            <div
                              key={guest._id}
                              onClick={() => {
                                if (hasEmail) {
                                  handleToggleGuestEmail(guest.email);
                                }
                              }}
                              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                                !hasEmail
                                  ? "opacity-50 cursor-not-allowed bg-transparent"
                                  : isSelected
                                  ? "bg-primary/8 border border-primary/20 cursor-pointer"
                                  : "hover:bg-gray-50 border border-transparent cursor-pointer"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs shrink-0 font-medium text-gray-700">
                                {guestName.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {guestName}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">
                                  {hasEmail ? (
                                    guest.email
                                  ) : (
                                    <span className="italic text-gray-400">
                                      No email on file
                                    </span>
                                  )}
                                </p>
                              </div>

                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                          );
                        }
                      })
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-6">
                        No guests matching search.
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Flyer Usage Counter ── */}
                {flyerLimit !== Infinity && (
                  <p className="text-xs text-gray-500 text-right">
                    Flyers used:{" "}
                    <span className="font-semibold text-gray-700">
                      {flyerUsage}
                    </span>{" "}
                    / {flyerLimit}
                  </p>
                )}

                {/* ── Action Buttons ── */}
                <div className="flex gap-2.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("channel")}
                    className="h-12 px-4 text-xs font-medium"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSend(false)}
                    disabled={
                      activeRecipients.length === 0 ||
                      createCampaignMutation.isPending
                    }
                    className="flex-1 h-12 text-sm font-semibold flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/95"
                  >
                    {createCampaignMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {createCampaignMutation.isPending
                      ? "Sending..."
                      : `Send Invitation (${activeRecipients.length})`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flyer Limit Reached Modal */}
      <FlyerLimitModal
        isOpen={showLimitModal}
        onClose={handleLimitClose}
        onAccept={handleLimitAccept}
        flyerLimit={flyerLimit}
        flyerUsage={flyerUsage}
        planLabel={planLabel}
      />
    </>
  );
};

export default SendInvitationForm;
