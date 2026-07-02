"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, X, ChevronLeft, Mail, Users, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useGetCampaigns, useGetCampaignById } from "@/lib/hooks/queries/useQueries";
import { useRetryCampaign } from "@/lib/hooks/mutations/CampaignMutations";
import { useQueryClient } from "@tanstack/react-query";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";

/* ─── helpers ──────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const extractStatusString = (status) => {
  if (!status) return "Unknown";
  if (typeof status === "string") return status;
  if (typeof status === "object") {
    // Check value property
    if (status.value && typeof status.value === "string") return status.value;
    // Check status property
    if (status.status && typeof status.status === "string") return status.status;
    
    // Recursively extract if value or status are objects
    if (status.value && typeof status.value === "object") {
      return extractStatusString(status.value);
    }
    if (status.status && typeof status.status === "object") {
      return extractStatusString(status.status);
    }
    
    // Try to find any string property
    for (const key of Object.keys(status)) {
      if (typeof status[key] === "string" && status[key]) {
        return status[key];
      }
    }
  }
  return "Unknown";
};

const statusConfig = (status) => {
  const statusStr = extractStatusString(status);
  
  switch (statusStr.toUpperCase()) {
    case "SENT":
    case "COMPLETED":
    case "DELIVERED":
      return { label: "Delivered", cls: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> };
    case "FAILED":
      return { label: "Failed", cls: "bg-red-100 text-red-600", icon: <XCircle className="w-3.5 h-3.5" /> };
    case "PENDING":
      return { label: "Pending", cls: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3.5 h-3.5" /> };
    default:
      return { label: statusStr, cls: "bg-gray-100 text-gray-600", icon: <AlertCircle className="w-3.5 h-3.5" /> };
  }
};



const getCampaignImage = (image) => {
  if (!image) return null;
  return typeof image === "object" ? image.location : image;
};

/* ─── Campaign Detail View ─────────────────────────── */
const CampaignDetail = ({ campaignId, onBack }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetCampaignById(campaignId);
  const { mutate: retry, isPending: isRetrying } = useRetryCampaign();

  const campaign = data?.data || data;

  const handleRetry = () => {
    retry(campaignId, {
      onSuccess: () => {
        SuccessToast("Campaign retry initiated successfully!");
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      },
      onError: (err) => {
        ErrorToast(err?.response?.data?.message || "Failed to retry campaign.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Campaign not found.
      </div>
    );
  }

  const st = statusConfig(campaign.status);

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to History
      </button>

      {/* Status + Retry */}
      <div className="flex items-center justify-between mb-5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
          {st.icon} {st.label}
        </span>
        {(() => {
          const statusStr = extractStatusString(campaign.status);
          const isFailed = statusStr.toUpperCase() === "FAILED";
          return isFailed && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              size="sm"
              className="flex items-center gap-1.5 text-xs"
            >
              {isRetrying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {isRetrying ? "Retrying..." : "Retry Send"}
            </Button>
          );
        })()}
      </div>

      {/* Flyer Image */}
      {getCampaignImage(campaign.image) && (
        <div className="mb-5 rounded-xl overflow-hidden border">
          <img
            src={getCampaignImage(campaign.image)}
            alt="Campaign Flyer"
            className="w-full max-h-64 object-cover"
          />
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> Channel
          </p>
          <p className="text-sm font-semibold capitalize">{campaign.channel || "email"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Sent At
          </p>
          <p className="text-sm font-semibold">{formatDate(campaign.sentAt || campaign.createdAt)}</p>
        </div>
      </div>

      {/* Additional Info */}
      {campaign.additionalInfo && (
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs text-gray-400 mb-1">Additional Info</p>
          <div 
            className="text-sm text-gray-700 font-light"
            dangerouslySetInnerHTML={{ __html: campaign.additionalInfo }}
          />
        </div>
      )}

      {/* Recipients */}
      {campaign.recipients?.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Recipients ({campaign.recipients.length})
          </p>
          <div className="border rounded-xl divide-y max-h-48 overflow-y-auto">
            {campaign.recipients.map((recipient, i) => {
              const emailStr = typeof recipient === "object" ? recipient.value : recipient;
              return (
                <div key={i} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                  {emailStr}
                </div>
              );
            })}
          </div>
        </div>
      ) : campaign.totalRecipients > 0 ? (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Recipients ({campaign.totalRecipients})
          </p>
          <div className="border rounded-xl p-4 text-sm text-gray-500 bg-gray-50">
            Sent to {campaign.totalRecipients} recipient(s).
          </div>
        </div>
      ) : null}
    </div>
  );
};

/* ─── Campaign List ────────────────────────────────── */
const CampaignList = ({ onSelect }) => {
  const { data, isLoading } = useGetCampaigns();
  const campaigns = data?.data || data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <div className="text-center py-16">
        <Mail className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No campaigns sent yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
      {campaigns.map((campaign) => {
        const st = statusConfig(campaign.status);
        const imgUrl = getCampaignImage(campaign.image);
        const recipientsCount = campaign.totalRecipients ?? campaign.recipients?.length ?? 0;

        return (
          <div
            key={campaign._id}
            onClick={() => onSelect(campaign._id)}
            className="flex items-center gap-4 border rounded-xl p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition group"
          >
            {/* Flyer thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
              {imgUrl ? (
                <img src={imgUrl} alt="flyer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-800 truncate capitalize">
                  {campaign.channel || "Email"} Campaign
                </p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${st.cls}`}>
                  {st.icon} {st.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate">
                {recipientsCount} recipient{recipientsCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(campaign.sentAt || campaign.createdAt)}</p>
            </div>

            {/* Arrow */}
            <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-gray-500 transition flex-shrink-0" />
          </div>
        );
      })}
    </div>
  );
};

/* ─── Main FlyerHistory Component ──────────────────── */
const FlyerHistory = ({ isOpen, onOpenChange }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleClose = () => {
    setSelectedId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedId ? "Campaign Detail" : "Flyer History"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {selectedId ? (
            <CampaignDetail
              campaignId={selectedId}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <CampaignList onSelect={setSelectedId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlyerHistory;
