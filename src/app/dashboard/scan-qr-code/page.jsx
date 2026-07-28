"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "@/axios";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import moment from "moment";
import {
  Camera,
  CameraOff,
  Crown,
  RefreshCw,
  User,
  Phone,
  Calendar,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
  IdCard,
} from "lucide-react";

/**
 * Extracts passId from a raw QR code string or URL.
 * Handles formats like:
 * - "https://resvor-lounge-manager.vercel.app/verify-qrcode/6a62f9be03698dc8a0228837"
 * - "http://localhost:3051/vip-pass/verify/6a5de858059913b8ce9b0979"
 * - "6a62f9be03698dc8a0228837"
 */
export const extractPassId = (scannedText) => {
  if (!scannedText) return "";
  const trimmed = scannedText.trim();

  if (trimmed.includes("/")) {
    try {
      const parts = trimmed.split("/").filter(Boolean);
      const lastPart = parts[parts.length - 1];
      return lastPart.split("?")[0].split("#")[0];
    } catch (e) {
      return trimmed;
    }
  }
  return trimmed;
};

const ScanQrCode = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const html5QrcodeRef = useRef(null);
  const isVerifyingRef = useRef(false);

  // Keep ref in sync to avoid duplicate requests while verifying or modal open
  useEffect(() => {
    isVerifyingRef.current = isVerifying || isModalOpen;
  }, [isVerifying, isModalOpen]);

  // Main function to call GET API /vip-pass/verify/:passId
  const handleVerifyPass = useCallback(async (rawCode) => {
    const passId = extractPassId(rawCode);
    if (!passId) {
      ErrorToast("Invalid QR code data");
      return;
    }

    setIsVerifying(true);
    setImgError(false);

    try {
      const response = await axios.get(`/vip-pass/verify/${passId}`);
      console.log("VIP Pass Verification Response:", response.data);

      const passData = response.data?.data?.pass || response.data?.pass || response.data?.data;
      if (response.data?.success || response.status === 200) {
        setVerifiedPass(passData || { _id: passId });
        setIsModalOpen(true);
        SuccessToast(response.data?.message || "VIP pass is valid!");
      } else {
        const errorMsg = response.data?.message || "VIP pass verification failed";
        ErrorToast(errorMsg);
      }
    } catch (error) {
      console.error("Error verifying VIP pass:", error);
      const apiErrorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Invalid or expired VIP pass";
      ErrorToast(apiErrorMessage);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Stop scanner safely
  const stopScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        await html5QrcodeRef.current.clear();
      } catch (err) {
        console.warn("Scanner stop error:", err);
      } finally {
        html5QrcodeRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  // Start scanner safely
  const startScanner = useCallback(async () => {
    setCameraError(null);
    await stopScanner();

    const elementId = "qr-reader-viewport";
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const html5Qrcode = new Html5Qrcode(elementId);
      html5QrcodeRef.current = html5Qrcode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5Qrcode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (isVerifyingRef.current) return;
          console.log("Scanned QR Code:", decodedText);
          handleVerifyPass(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Camera access error:", err);
      let msg = "Could not access camera. Please check camera permissions.";
      if (err?.name === "NotAllowedError" || err === "Permission denied") {
        msg = "Camera permission denied. Please grant permission in your browser.";
      } else if (err?.name === "NotFoundError") {
        msg = "No camera found on your device.";
      }
      setCameraError(msg);
      setIsScanning(false);
    }
  }, [stopScanner, handleVerifyPass]);

  // Start camera on mount
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVerifiedPass(null);
  };

  // Helper to resolve user profile picture URL from response data
  const profilePicUrl =
    typeof verifiedPass?.user?.profilePicture === "object"
      ? verifiedPass?.user?.profilePicture?.location
      : typeof verifiedPass?.user?.profilePicture === "string"
        ? verifiedPass?.user?.profilePicture
        : null;

  const userFullName =
    `${verifiedPass?.user?.firstName || ""} ${verifiedPass?.user?.lastName || ""}`.trim() ||
    "VIP Guest";

  return (
    <div className="min-h-full bg-slate-50 flex flex-col justify-center items-center p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4 text-amber-600" /> VIP Pass Scanner
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Scan QR Code
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Point camera at the QR code to verify guest VIP status
          </p>
        </div>

        {/* Main Camera Card Container */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center">
          {/* QR Code Camera Frame */}
          <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center mb-6 border-2 border-slate-800">
            {/* Corner Brackets styling */}
            <div className="absolute top-3 left-3 w-8 h-8 border-l-4 border-t-4 border-amber-400 rounded-tl-md z-10 pointer-events-none"></div>
            <div className="absolute top-3 right-3 w-8 h-8 border-r-4 border-t-4 border-amber-400 rounded-tr-md z-10 pointer-events-none"></div>
            <div className="absolute bottom-3 left-3 w-8 h-8 border-l-4 border-b-4 border-amber-400 rounded-bl-md z-10 pointer-events-none"></div>
            <div className="absolute bottom-3 right-3 w-8 h-8 border-r-4 border-b-4 border-amber-400 rounded-br-md z-10 pointer-events-none"></div>

            {/* HTML5 QR Scanner element */}
            <div
              id="qr-reader-viewport"
              className="w-full h-full object-cover"
            ></div>

            {/* Overlays while scanning */}
            {isScanning && !isVerifying && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-10">
                {/* Glowing scanning laser line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-bounce mt-16"></div>

                <span className="bg-slate-900/85 backdrop-blur-md text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/30 tracking-wide mb-2 flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Scanning QR code...
                </span>
              </div>
            )}

            {/* Loading state during API verification */}
            {isVerifying && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white gap-3 p-4 text-center">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                <p className="font-semibold text-sm text-slate-200">
                  Verifying VIP Pass...
                </p>
              </div>
            )}

            {/* Camera Error overlay */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-300 z-20">
                <CameraOff className="w-12 h-12 text-rose-400 mb-3" />
                <p className="text-sm font-medium text-rose-300 mb-4">{cameraError}</p>
                <button
                  onClick={startScanner}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Bottom Camera Toggle Button */}
          <div className="w-full">
            {isScanning ? (
              <button
                onClick={stopScanner}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <CameraOff className="w-4 h-4 text-slate-500" /> Stop Camera
              </button>
            ) : (
              <button
                onClick={startScanner}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0f0a2e] hover:bg-[#1a1442] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 text-amber-400" /> Scan Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIP Verification Modal */}
      {isModalOpen && verifiedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A150F80] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[515px] rounded-[26px] shadow-lg p-6 sm:p-8 border border-slate-100 transform transition-all scale-100">
            {/* Close button matching AuthSuccessModal */}
            <div className="flex justify-end items-center pb-2">
              <span
                onClick={handleCloseModal}
                className="cursor-pointer border-[1px] border-gray-200 rounded-sm p-[2px] hover:bg-gray-50 text-gray-400 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 font-light text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10 3.636 5.05A1 1 0 015.05 3.636L10 8.586z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            {/* Header Content */}
            <div className="flex flex-col justify-center items-center text-center">
              <img
                src="/images/SuccessCheck.png"
                alt="success"
                className="w-[90px] mb-3"
              />

              <h2 className="text-[24px] sm:text-[28px] text-[#181818] font-[600] capitalize tracking-tight">
                User is VIP Verified
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[#565656] mt-1">
                VIP Pass access granted successfully
              </p>
            </div>

            {/* Modal Body / Pass details */}
            <div className="mt-6 space-y-4">
              {/* User Profile Card */}
              <div className="bg-[#F9FAFB] rounded-[16px] p-4 border border-gray-100 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#0f0a2e] text-white font-bold text-xl flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                  {profilePicUrl && !imgError ? (
                    <img
                      src={profilePicUrl}
                      alt={userFullName}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span>
                      {verifiedPass?.user?.firstName
                        ? verifiedPass.user.firstName.charAt(0).toUpperCase()
                        : "V"}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-[#181818] truncate">
                      {userFullName}
                    </h4>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>

                  {verifiedPass?.user?.phoneNumber ? (
                    <p className="text-xs text-[#565656] flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {verifiedPass.user.phoneNumber}
                    </p>
                  ) : (
                    <p className="text-xs text-[#565656] mt-1">VIP Pass Member</p>
                  )}
                </div>
              </div>

              {/* Detailed Info Table */}
              <div className="space-y-2.5 bg-[#F9FAFB] p-4 rounded-[16px] border border-gray-100 text-xs">
                {verifiedPass?.user?._id && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                    <span className="text-[#565656] font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" /> User ID:
                    </span>
                    <span className="font-mono font-bold text-[#181818] bg-white px-2 py-0.5 rounded border border-gray-200">
                      {verifiedPass.user._id}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-[#565656] font-medium flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-gray-400" /> Pass ID:
                  </span>
                  <span className="font-mono font-bold text-[#181818] bg-white px-2 py-0.5 rounded border border-gray-200">
                    {verifiedPass?._id || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-[#565656] font-medium">VIP Status:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                  </span>
                </div>

                {verifiedPass?.createdAt && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#565656] font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Verified On:
                    </span>
                    <span className="font-semibold text-[#181818]">
                      {moment(verifiedPass.createdAt).format("MMM DD, YYYY · hh:mm A")}
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Action Button */}
              <button
                onClick={() => {
                  handleCloseModal();
                  startScanner();
                }}
                className="w-full py-3.5 rounded-[12px] bg-[#0f0a2e] hover:bg-[#1a1442] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" /> Scan Next QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanQrCode;
