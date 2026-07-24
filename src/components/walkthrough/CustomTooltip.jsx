"use client";

import React from "react";

const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}) => {
  return (
    <div
      {...tooltipProps}
      className="bg-white rounded-[24px] p-6 sm:p-7 shadow-2xl border border-slate-100 max-w-sm w-full transition-all text-slate-900 relative z-[99999]"
    >
      {/* Step Title */}
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 tracking-tight">
        {step.title}
      </h3>

      {/* Step Description */}
      <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
        {step.content}
      </p>

      {/* Footer Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Skip button */}
        <button
          {...closeProps}
          className="flex-1 py-3 px-5 rounded-2xl bg-[#f0f0f4] hover:bg-[#e4e4ea] text-slate-800 font-semibold text-sm transition-all active:scale-95 text-center"
        >
          Skip
        </button>

        {/* Back button (optional, if index > 0) */}
        {index > 0 && (
          <button
            {...backProps}
            className="py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all active:scale-95"
          >
            Back
          </button>
        )}

        {/* Next / Finish button */}
        <button
          {...primaryProps}
          className="flex-1 py-3 px-6 rounded-2xl bg-[#000053] hover:bg-[#00003b] text-white font-bold text-sm transition-all shadow-md active:scale-95 text-center"
        >
          {isLastStep ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default CustomTooltip;
