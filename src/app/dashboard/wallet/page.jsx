"use client";

import React from "react";
import Wallet from "@/components/settings/Wallet";

const WalletPage = () => {
  return (
    <div>
      <div className="flex items-center gap-10 mt-2">
        <h1 className="section-heading">Payments</h1>
      </div>
      <div className="mt-6 bg-white rounded-2xl">
        <Wallet />
      </div>
    </div>
  );
};

export default WalletPage;
