"use client";
import { useState } from "react";
import { useWalletTransactions } from "@/lib/hooks/queries/useQueries";
import TransactionHistoryTable from "./TransactionHistoryTable";
import AvailableBalance from "./AvailableBalance";

const Wallet = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: txResponse, isLoading: isLoadingTx } = useWalletTransactions({
    page: currentPage,
    limit: 10,
  });

  const transactions = txResponse?.data || [];
  const pagination = txResponse?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="mx-auto px-6 py-8">

      {/* ── Balance Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* Available Balance */}
        <AvailableBalance />

        {/* Stats card */}
        <div className="rounded-2xl border border-gray-200 px-6 py-6 flex flex-col justify-between bg-gray-50">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Transactions</p>
            <p className="text-3xl font-bold text-[#181818] mt-1">
              {isLoadingTx ? "—" : (pagination?.totalItems ?? transactions.length)}
            </p>
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-gray-500 text-sm font-medium">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {isLoadingTx
                ? "—"
                : transactions.filter((t) => t.status === "COMPLETED").length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div>
        <h3 className="text-[16px] font-bold text-[#181818] mb-4">
          Transaction History
        </h3>

        <TransactionHistoryTable
          transactions={transactions}
          isLoadingTx={isLoadingTx}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default Wallet;
