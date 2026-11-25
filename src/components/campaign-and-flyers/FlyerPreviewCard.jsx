"use client";
import React from "react";
import { Upload } from "lucide-react";
import { formatTime12h, hasFlyerOverlayData } from "@/lib/utils/flyerUtils";

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${month}/${day}/${year}`;
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

const FlyerPreviewCard = ({
  imageUrl,
  values = {},
  captureRef,
  className = "",
  compact = false,
}) => {
  const showOverlay = Boolean(imageUrl) && hasFlyerOverlayData(values);

  return (
    <div
      ref={captureRef}
      className={`relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg select-none bg-gray-100 ${className}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={values.eventTitle || "Flyer Preview"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <div
            className={`${
              compact ? "w-8 h-8 mb-1.5" : "w-14 h-14 mb-3"
            } rounded-2xl bg-white shadow-2xs flex items-center justify-center text-gray-400 border border-gray-200`}
          >
            <Upload className={`${compact ? "w-4 h-4" : "w-6 h-6"} stroke-[1.5]`} />
          </div>
          {!compact && (
            <>
              <p className="text-sm font-semibold text-gray-700">
                No Image Selected
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                Upload a custom flyer image to preview
              </p>
            </>
          )}
        </div>
      )}

      {showOverlay && !compact && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/80 pointer-events-none" />

          <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 bg-black/55 backdrop-blur-xs rounded-xl border border-white/15 px-3.5 py-4 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="w-8 h-[2.5px] rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c] mb-3" />

            <h2
              className="text-white font-bold leading-snug text-center mb-3 tracking-wide break-words drop-shadow-md w-full"
              style={{
                fontSize:
                  values.eventTitle && values.eventTitle.length > 35
                    ? "12px"
                    : "14px",
              }}
            >
              {values.eventTitle || "Event Title"}
            </h2>

            <div className="w-full h-px bg-white/20 mb-3" />

            <div className="flex flex-col gap-1.5 w-full text-[10px] text-white">
              <div className="flex items-center gap-1.5">
                <span className="text-white/60 font-semibold min-w-[46px]">
                  Date:
                </span>
                <span className="text-white/95 font-medium truncate">
                  {formatDisplayDate(values.eventDate)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-white/60 font-semibold min-w-[46px]">
                  Time:
                </span>
                <span className="text-white/95 font-medium truncate">
                  {values.eventStartTime
                    ? `${formatTime12h(values.eventStartTime)}${
                        values.eventEndTime
                          ? ` - ${formatTime12h(values.eventEndTime)}`
                          : ""
                      }`
                    : "—"}
                </span>
              </div>

              <div className="flex items-start gap-1.5">
                <span className="text-white/60 font-semibold min-w-[46px] shrink-0">
                  Location:
                </span>
                <span className="text-white/95 font-medium leading-tight break-words min-w-0 line-clamp-2">
                  {values.address
                    ? `${values.address}${values.city ? `, ${values.city}` : ""}`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="w-8 h-[2.5px] rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c] mt-3" />
          </div>
        </>
      )}

      {showOverlay && compact && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 py-1.5 pointer-events-none">
          <p className="text-[10px] font-semibold text-white truncate">
            {values.eventTitle || "Flyer"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FlyerPreviewCard;
