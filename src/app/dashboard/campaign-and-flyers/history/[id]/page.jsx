"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, RefreshCw, Mail, Clock, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";
import { useGetCampaignById } from "@/lib/hooks/queries/useQueries";
import { useRetryCampaign } from "@/lib/hooks/mutations/CampaignMutations";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusConfig = (status) => {
  const statusStr = typeof status === "object" ? (status?.value || status?.status) : status;
  switch (statusStr?.toUpperCase()) {
    case "SENT":
    case "COMPLETED":
    case "DELIVERED":
      return { label: "Delivered", cls: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle className="w-4 h-4 text-green-600" /> };
    case "FAILED":
      return { label: "Failed", cls: "bg-red-100 text-red-600 border-red-200", icon: <XCircle className="w-4 h-4 text-red-600" /> };
    case "PENDING":
      return { label: "Pending", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock className="w-4 h-4 text-yellow-600" /> };
    default:
      return { label: statusStr || "Unknown", cls: "bg-gray-100 text-gray-600 border-gray-200", icon: <AlertCircle className="w-4 h-4 text-gray-500" /> };
  }
};

const getCampaignImage = (image) => {
  if (!image) return null;
  return typeof image === "object" ? image.location : image;
};

const CampaignDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const campaignId = params.id;

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
      <div className="flex-1 flex justify-center items-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex-1 p-6 text-center py-32">
        <p className="text-gray-500 font-medium">Campaign not found.</p>
        <Button onClick={() => router.push("/dashboard/campaign-and-flyers/history")} className="mt-4">
          Back to History
        </Button>
      </div>
    );
  }

  // Calculate statistics from the recipients array
  const recipientsList = campaign.recipients || [];
  const totalSent = recipientsList.length || campaign.totalRecipients || 0;
  
  const totalDelivered = recipientsList.filter(
    (r) => r.status?.toUpperCase() === "DELIVERED" || r.status?.toUpperCase() === "SENT" || r.status?.toUpperCase() === "COMPLETED"
  ).length;

  const totalFailed = recipientsList.filter(
    (r) => r.status?.toUpperCase() === "FAILED"
  ).length;

  // Render retry button if overall status is FAILED or if there are failed items
  const overallStatusStr = typeof campaign.status === "object" ? (campaign.status?.value || campaign.status?.status) : campaign.status;
  const hasFailedAttempt = overallStatusStr?.toUpperCase() === "FAILED" || totalFailed > 0;

  const st = statusConfig(campaign.status);

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">        
          <div>
            <h1 className="section-heading text-3xl font-bold">Campaign Details</h1>            
          </div>
        </div>

        {hasFailedAttempt && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 h-12 px-6"
          >
            {isRetrying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isRetrying ? "Retrying..." : "Retry Sent"}
          </Button>
        )}
      </div>
        <div className="bg-white rounded-lg border border-white p-4 ">
          <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#F5F5F5]" >


      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Info & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl  p-5 flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Sent</span>
              <span className="text-3xl font-bold text-gray-900 mt-2">{totalSent}</span>
            </div>
            
            <div className="bg-white rounded-2xl  p-5 flex flex-col justify-between">
              <span className="text-green-500/80 text-xs font-semibold uppercase tracking-wider">Delivered</span>
              <span className="text-3xl font-bold text-green-600 mt-2">{totalDelivered}</span>
            </div>

            <div className="bg-white rounded-2xl  p-5 flex flex-col justify-between">
              <span className="text-red-500/80 text-xs font-semibold uppercase tracking-wider">Failed</span>
              <span className="text-3xl font-bold text-red-600 mt-2">{totalFailed}</span>
            </div>
          </div>

          {/* Campaign Details Info Card */}
          <div className="bg-white rounded-2xl  p-6  space-y-5">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3">General Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Campaign Status</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                    {st.icon} {st.label}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Channel</p>
                <p className="text-sm font-semibold text-gray-800 mt-2 capitalize">{campaign.channel || "email"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Created At</p>
                <p className="text-sm text-gray-700 mt-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(campaign.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Last Updated At</p>
                <p className="text-sm text-gray-700 mt-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(campaign.updatedAt)}
                </p>
              </div>
            </div>

            {/* Additional Info Box */}
            {campaign.additionalInfo && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Additional Description</p>
                <div 
                  className="text-sm text-gray-700 leading-relaxed font-light html-content"
                  dangerouslySetInnerHTML={{ __html: campaign.additionalInfo }}
                />
              </div>
            )}
          </div>

          {/* Recipients List */}
          <div className="bg-white rounded-2xl p-6  space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              Recipients Directory
            </h3>

            {recipientsList.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No specific recipient details available.</p>
            ) : (
              <div className="overflow-hidden border rounded-xl divide-y">
                {recipientsList.map((rec, i) => {
                  const state = statusConfig(rec.status);
                  return (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-gray-50 transition gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{rec.value}</p>
                        {rec.failureReason && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Reason: {rec.failureReason}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 flex-wrap shrink-0">
                        <span className="text-xs text-gray-400">
                          Attempts: <span className="font-semibold text-gray-700">{rec.attempts || 1}</span>
                        </span>
                        {rec.lastAttemptedAt && (
                          <span className="text-xs text-gray-400">
                            Tried: <span className="font-semibold text-gray-700">{new Date(rec.lastAttemptedAt).toLocaleTimeString()}</span>
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${state.cls}`}>
                          {state.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Image / Flyer Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl  p-6  space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Flyer Preview</h3>
            
            {getCampaignImage(campaign.image) ? (
              <div className="rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center">
                <img
                  src={getCampaignImage(campaign.image)}
                  alt="Campaign Flyer"
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
            ) : (
              <div className="border border-dashed rounded-xl h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                <Mail className="w-12 h-12 mb-2 text-gray-300" />
                <span className="text-sm">No flyer image attached</span>
              </div>
            )}
          </div>
        </div>

      </div>
                </div>
              </div>
    </div>
  );
};

export default CampaignDetailPage;
