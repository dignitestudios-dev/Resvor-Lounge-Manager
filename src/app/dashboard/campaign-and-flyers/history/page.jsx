"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import { useGetCampaigns } from "@/lib/hooks/queries/useQueries";
import { Button } from "@/components/ui/button";
import utils from "@/lib/utils";

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

const statusConfig = (status) => {
  const statusStr = typeof status === "object" ? (status?.value || status?.status) : status;
  switch (statusStr?.toUpperCase()) {
    case "SENT":
    case "COMPLETED":
    case "DELIVERED":
      return { label: "Delivered", cls: "bg-green-100 text-green-700 border-green-200" };
    case "FAILED":
      return { label: "Failed", cls: "bg-red-100 text-red-600 border-red-200" };
    case "PENDING":
      return { label: "Pending", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    default:
      return { label: statusStr || "Unknown", cls: "bg-gray-100 text-gray-600 border-gray-200" };
  }
};

const getCampaignImage = (image) => {
  if (!image) return null;
  return typeof image === "object" ? image.location : image;
};

const CampaignHistoryPage = () => {
  const router = useRouter();
  const { data, isLoading } = useGetCampaigns();
  const campaigns = data?.data || data || [];

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">

          <div>
            <h1 className="section-heading text-3xl font-bold">Campaign History</h1>
          
          </div>
        </div>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-6 flex justify-center items-center py-32 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border p-6 text-center py-32 shadow-sm">
          <Mail className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No campaigns sent yet.</p>
          <p className="text-gray-400 text-sm mt-1">Design a flyer and send it to your guests to get started.</p>
          <Button
            onClick={() => router.push("/dashboard/campaign-and-flyers")}
            className="mt-6"
          >
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#E8E8FF]">
                <th className="px-4 py-5 text-left text-nowrap">Flyer</th>
                <th className="px-4 py-5 text-left text-nowrap">Campaign Type</th>
                <th className="px-4 py-5 text-left text-nowrap">Sent At</th>
                <th className="px-4 py-5 text-left text-nowrap">Recipients</th>
                <th className="px-4 py-5 text-left text-nowrap">Status</th>
                <th className="px-4 py-5 text-center text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const st = statusConfig(campaign.status);
                const imgUrl = getCampaignImage(campaign.image);
                const recipientsCount = campaign.totalRecipients ?? campaign.recipients?.length ?? 0;

                return (
                  <tr
                    key={campaign._id}
                    onClick={() => router.push(`/dashboard/campaign-and-flyers/history/${campaign._id}`)}
                    className="border-b border-[#D4D4D4] cursor-pointer hover:bg-gray-50 transition-all"
                  >
                    <td className="px-4 py-6">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {imgUrl ? (
                          <img src={imgUrl} alt="flyer" className="w-full h-full object-cover" />
                        ) : (
                          <Mail className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-6 font-semibold text-gray-800 capitalize">
                      {campaign.channel || "Email"} Campaign
                    </td>
                    <td className="px-4 py-6 text-gray-500 text-sm">
                      {formatDate(campaign.sentAt || campaign.createdAt)}
                    </td>
                    <td className="px-4 py-6 text-gray-700 font-medium">
                      {recipientsCount} recipient{recipientsCount !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-6">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-nowrap">
                      <div className="flex justify-center items-center cursor-pointer">
                        <IoIosArrowForward size={24} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignHistoryPage;
