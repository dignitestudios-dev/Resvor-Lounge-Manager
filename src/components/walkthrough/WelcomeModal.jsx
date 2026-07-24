"use client";

import React from "react";

const WelcomeModal = ({ isOpen, onStart, onSkip }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl border border-slate-100 transform transition-all scale-100 flex flex-col items-center">
        {/* 😇 Halo Emoji Icon */}
        <div className="mb-6 relative flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-6xl sm:text-7xl select-none filter drop-shadow-md">
            😇
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Welcome To Resvor!
        </h2>

        {/* Subtitle */}
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
          Here’s a quick walkthrough to help you manage bookings, track guests, and maximize Resvor’s tools.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            onClick={onStart}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#000053] hover:bg-[#00003b] text-white font-bold text-sm transition-all shadow-md active:scale-95"
          >
            Start Walkthrough
          </button>
          <button
            onClick={onSkip}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#f0f0f4] hover:bg-[#e4e4ea] text-slate-800 font-semibold text-sm transition-all active:scale-95"
          >
            Skip For Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
