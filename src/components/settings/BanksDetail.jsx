"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { IoIosArrowForward } from "react-icons/io";
import { useGetConnectBanks } from "@/lib/hooks/queries/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/axios";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import { Loader2, Landmark, CheckCircle2, Plus } from "lucide-react";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/Stripe";

const BanksDetailContent = () => {
  const [open, setOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [showAddBankForm, setShowAddBankForm] = useState(false);

  // Bank Tokenization form state
  const [routingNumberVal, setRoutingNumberVal] = useState("");
  const [accountNumberVal, setAccountNumberVal] = useState("");
  const [holderNameVal, setHolderNameVal] = useState("");
  const [holderTypeVal, setHolderTypeVal] = useState("company");
  const [isTokenizing, setIsTokenizing] = useState(false);

  const stripe = useStripe();
  const queryClient = useQueryClient();

  const { data: banksResponse, isLoading, refetch } = useGetConnectBanks({
    enabled: open,
  });

  const banksList = banksResponse?.data || [];

  const handleSetDefault = async (bank) => {
    const bankIdToUse = bank._id || bank.bankId;
    if (!bankIdToUse || bank.selected || updatingId) return;

    setUpdatingId(bankIdToUse);
    try {
      const response = await axiosInstance.patch(
        `/connect/banks/${bankIdToUse}/default`
      );
      SuccessToast(
        response?.data?.message || "Default bank updated successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ["connect-banks"] });
      refetch();
    } catch (err) {
      console.error("Failed to set default bank:", err);
      ErrorToast(
        err?.response?.data?.message ||
        "Failed to set default bank account. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTokenizeBank = (e) => {
    e.preventDefault();
    if (!stripe) {
      ErrorToast("Stripe.js has not initialized yet.");
      return;
    }
    if (!routingNumberVal || !accountNumberVal || !holderNameVal) {
      ErrorToast("Please fill in all bank account details.");
      return;
    }

    setIsTokenizing(true);
    stripe
      .createToken("bank_account", {
        country: "US",
        currency: "usd",
        routing_number: routingNumberVal,
        account_number: accountNumberVal,
        account_holder_name: holderNameVal,
        account_holder_type: holderTypeVal,
      })
      .then(async function (result) {
        if (result.error) {
          ErrorToast(result.error.message || "Failed to tokenize bank account.");
          setIsTokenizing(false);
        } else {
          try {
            const response = await axiosInstance.post("/connect/banks", {
              token: result.token.id,
            });

            SuccessToast(
              response?.data?.message || "Bank account attached successfully!"
            );
            setShowAddBankForm(false);
            setRoutingNumberVal("");
            setAccountNumberVal("");
            setHolderNameVal("");
            setHolderTypeVal("company");
            queryClient.invalidateQueries({ queryKey: ["connect-banks"] });
            queryClient.invalidateQueries({ queryKey: ["connect-status"] });
            refetch();
          } catch (err) {
            console.error(err);
            ErrorToast(
              err?.response?.data?.message || "Failed to attach bank account."
            );
          } finally {
            setIsTokenizing(false);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorToast("An error occurred during bank account tokenization.");
        setIsTokenizing(false);
      });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setShowAddBankForm(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="w-full border-b flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 text-left">
          <p className="text-base font-medium text-gray-900">Banks Detail</p>
          <IoIosArrowForward size={24} />

        </button>
      </DialogTrigger>

      <DialogContent className="min-w-3xl max-w-full">
        <DialogHeader className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Banks Detail
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-600">
                Manage your connected bank accounts and select your default account for payouts and withdrawals.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBankForm((prev) => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#012C57] to-[#061523] text-white hover:opacity-95 transition shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              {showAddBankForm ? "Cancel" : "Add Bank"}
            </button>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {showAddBankForm && (
            <form
              onSubmit={handleTokenizeBank}
              className="p-5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-4 mb-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900">
                  Add Bank Account Details
                </h3>
                <span className="text-[11px] text-gray-500 font-medium">
                  Secured by Stripe
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe / Business Name"
                  value={holderNameVal}
                  onChange={(e) => setHolderNameVal(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none bg-white text-black"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    placeholder="110000000"
                    value={routingNumberVal}
                    onChange={(e) => setRoutingNumberVal(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none bg-white text-black"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="000123456789"
                    value={accountNumberVal}
                    onChange={(e) => setAccountNumberVal(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none bg-white text-black"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Account Holder Type
                </label>
                <select
                  value={holderTypeVal}
                  onChange={(e) => setHolderTypeVal(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none bg-white text-black"
                >
                  <option value="company">Company</option>
                  <option value="individual">Individual</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBankForm(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  disabled={isTokenizing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTokenizing}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#012C57] to-[#061523] text-white hover:opacity-95 transition disabled:opacity-60 flex items-center gap-2 shadow-xs"
                >
                  {isTokenizing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Tokenizing & Adding...
                    </>
                  ) : (
                    "Add Bank Account"
                  )}
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#012C57]" />
              <p className="text-sm font-medium">Loading bank accounts...</p>
            </div>
          ) : banksList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Landmark className="w-6 h-6 text-[#012C57]" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                No bank accounts found
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                No connected bank accounts were found for your account. Click below to add a bank account.
              </p>
              {!showAddBankForm && (
                <button
                  type="button"
                  onClick={() => setShowAddBankForm(true)}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#012C57] to-[#061523] text-white hover:opacity-95 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Bank Account
                </button>
              )}
            </div>
          ) : (
            banksList.map((bank) => {
              const isSelected = !!bank.selected;
              const isUpdatingThis = updatingId === (bank._id || bank.bankId);

              return (
                <div
                  key={bank._id || bank.bankId}
                  onClick={() => !isSelected && handleSetDefault(bank)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${isSelected
                    ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      <Landmark className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-gray-900">
                          {bank.bankName || "Bank Account"}
                        </h4>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Default
                          </span>
                        )}
                        {bank.status && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 capitalize">
                            {bank.status}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <p>
                          Account Number:{" "}
                          <span className="font-semibold text-gray-800">
                            **** {bank.last4 || "----"}
                          </span>
                        </p>
                        {bank.routingNumber && (
                          <p>
                            Routing:{" "}
                            <span className="font-semibold text-gray-800">
                              {bank.routingNumber}
                            </span>
                          </p>
                        )}
                        {bank.currency && (
                          <p className="uppercase font-medium text-gray-600">
                            {bank.currency}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center justify-end">
                    {isUpdatingThis ? (
                      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl">
                        <Loader2 className="w-4 h-4 animate-spin text-[#012C57]" />
                        Updating...
                      </div>
                    ) : isSelected ? (
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(bank);
                        }}
                        className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BanksDetail = () => {
  return (
    <Elements stripe={getStripe()}>
      <BanksDetailContent />
    </Elements>
  );
};

export default BanksDetail;


