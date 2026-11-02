"use client";

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, Download, Share2, QrCode, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import { getPublicGuestbookUrl } from "@/lib/api/publicGuestbook";

/**
 * GuestbookQRCodeSection
 *
 * Universal QR code section for the lounge manager guestbook screen.
 * Links to the public guestbook entry page without any lounge-specific or manager-specific tokens.
 */
const GuestbookQRCodeSection = () => {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    setPublicUrl(getPublicGuestbookUrl());
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = publicUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      SuccessToast("Guestbook link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      ErrorToast("Failed to copy link.");
    }
  };

  const handleDownloadQR = () => {
    try {
      const canvas = document.getElementById("universal-guestbook-qr-canvas");
      if (!canvas) {
        ErrorToast("QR code preview not ready yet.");
        return;
      }

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) {
            ErrorToast("Failed to generate QR code image.");
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "resvor-guestbook-qr.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          SuccessToast("QR code downloaded successfully!");
        }, "image/png");
      } else {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "resvor-guestbook-qr.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        SuccessToast("QR code downloaded successfully!");
      }
    } catch (err) {
      ErrorToast("Failed to download QR code.");
    }
  };

  const handlePrintQR = () => {
    const canvas = document.getElementById("universal-guestbook-qr-canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resvor Guestbook QR Code</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 90vh;
                margin: 0;
                background-color: #f9fafb;
                color: #111827;
              }
              .card {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                text-align: center;
                max-width: 360px;
              }
              h2 { margin: 0 0 8px 0; font-size: 22px; color: #010053; }
              p { margin: 0 0 24px 0; font-size: 13px; color: #6b7280; }
              img { width: 240px; height: 240px; display: block; margin: 0 auto; }
              .url { margin-top: 20px; font-size: 12px; color: #9ca3af; word-break: break-all; }
              @media print {
                body { background: white; }
                .card { box-shadow: none; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Join Our Guestbook</h2>
              <p>Scan with your phone to add yourself to the lounge guestbook</p>
              <img src="${dataUrl}" alt="QR Code" />
              <div class="url">${publicUrl}</div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleNativeShare = async () => {
    if (!publicUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: "Join a Lounge Guestbook",
        text: "Share this QR code with guests so they can add themselves to a lounge guestbook.",
        url: publicUrl,
      });
      SuccessToast("Shared successfully!");
    } catch (err) {
      if (err.name !== "AbortError") {
        ErrorToast("Could not share link.");
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm my-4">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* QR Code Canvas Preview */}
        <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs flex-shrink-0 flex items-center justify-center">
          {publicUrl ? (
            <QRCodeCanvas
              id="universal-guestbook-qr-canvas"
              value={publicUrl}
              size={148}
              level="H"
              includeMargin={true}
            />
          ) : (
            <div className="w-[148px] h-[148px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
              <QrCode className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Instructions and Controls */}
        <div className="flex-1 flex flex-col justify-center gap-3 text-center md:text-left w-full">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                Universal Guestbook QR
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Universal Guestbook QR Code
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Share this QR code with guests so they can add themselves to a
              lounge guestbook.
            </p>
          </div>

          {/* Visible fallback URL */}
          <div className="flex items-center gap-2 max-w-xl">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 truncate select-all">
              {publicUrl || "Loading link..."}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-9 px-3 gap-1.5 text-xs shrink-0 cursor-pointer"
              aria-label="Copy guestbook link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>

          {/* Action buttons: Download & Native Share */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDownloadQR}
              className="h-9 px-4 gap-1.5 text-xs font-medium cursor-pointer"
              aria-label="Download QR code as PNG"
            >
              <Download className="w-3.5 h-3.5" />
              Download QR (PNG)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintQR}
              className="h-9 px-4 gap-1.5 text-xs font-medium cursor-pointer"
              aria-label="Print or view guestbook QR"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Display
            </Button>

            {canShare && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNativeShare}
                className="h-9 px-4 gap-1.5 text-xs font-medium cursor-pointer"
                aria-label="Share guestbook QR code"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share QR
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestbookQRCodeSection;

