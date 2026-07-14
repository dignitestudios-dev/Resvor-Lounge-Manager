"use client";
import React from "react";
import CustomPagination from "@/components/common/CustomPagination";

const centsToDollars = (cents) => (cents / 100).toFixed(2);

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusStyle = (status) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const TransactionHistoryTable = ({
  transactions = [],
  isLoadingTx = false,
  totalPages = 1,
  onPageChange = () => {},
  currentPage = 1,
}) => {
  return (
    <CustomPagination
      loading={isLoadingTx}
      totalPages={totalPages}
      onPageChange={onPageChange}
      currentPage={currentPage}
    >
      <div className="space-y-4">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left border-collapse bg-white rounded-xl">
            <thead>
              <tr className="border-b text-[#181818] text-[13.9px] font-[600]">
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Reference</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="border-b text-[13.9px] hover:bg-gray-50 transition">
                    <td className="py-4 px-4 text-gray-600">{formatDate(tx.createdAt)}</td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">
                      {tx.referenceId}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">{tx.type}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      ${centsToDollars(tx.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle(tx.status)}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 md:hidden">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No transactions yet.</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx._id}
                className="border rounded-xl p-4 shadow-sm bg-gray-50 hover:bg-white transition"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 text-sm font-medium">Date</span>
                  <span className="text-gray-800 font-semibold">{formatDate(tx.createdAt)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 text-sm font-medium">Type</span>
                  <span className="text-gray-800">{tx.type}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 text-sm font-medium">Amount</span>
                  <span className="text-gray-900 font-bold">${centsToDollars(tx.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm font-medium">Status</span>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CustomPagination>
  );
};

export default TransactionHistoryTable;
