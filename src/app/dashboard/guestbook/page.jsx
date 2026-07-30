"use client";
import React, { useState, useRef } from "react";
import Table from "@/components/guestbook/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import { Button } from "@/components/ui/button";
import AddGuestForm from "@/components/guestbook/AddGuestForm";
import { useGetGuestbook } from "@/lib/hooks/queries/useGuestbook";
import {
  useImportGuestbook,
  useExportGuestbook,
} from "@/lib/hooks/mutations/GuestbookMutations";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const Guest = () => {
  const [openForm, setOpenForm] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);

  // Date filter state — empty string means "no filter" (not sent to API)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: guestbookData, isLoading } = useGetGuestbook({
    page,
    startDate,
    endDate,
  });

  const importGuestbookMutation = useImportGuestbook();
  const exportGuestbookMutation = useExportGuestbook();

  const guests = guestbookData?.data || [];
  const pagination = guestbookData?.pagination || null;

  const handleFilterChange = ({ startDate: sd, endDate: ed }) => {
    setStartDate(sd || "");
    setEndDate(ed || "");
    setPage(1); // reset to first page on every filter change
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await importGuestbookMutation.mutateAsync(file);
      SuccessToast(res?.message || "Guestbook imported successfully!");
      queryClient.invalidateQueries(["guestbook-list"]);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to import guestbook CSV.";
      ErrorToast(errorMsg);
    } finally {
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const data = await exportGuestbookMutation.mutateAsync();
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `guestbook_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      SuccessToast("Guestbook exported successfully!");
    } catch (error) {
      let errorMsg = "Failed to export guestbook CSV.";
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          errorMsg = parsed?.message || errorMsg;
        } catch {
          // ignore
        }
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      ErrorToast(errorMsg);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Guest Book</h1>

        <div className="flex items-center gap-5 ">
          <Button
            variant={"outline"}
            className={"border-2 h-12 text-[14px] px-6"}
            onClick={handleExportCSV}
            disabled={exportGuestbookMutation.isPending}
          >
            {exportGuestbookMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "CSV Export"
            )}
          </Button>

          <Button
            variant={"outline"}
            className={"border-2 h-12 text-[14px] px-6"}
            onClick={handleImportClick}
            disabled={importGuestbookMutation.isPending}
          >
            {importGuestbookMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "CSV Import"
            )}
          </Button>

          <AddGuestForm isOpen={openForm} onOpenChange={setOpenForm} />

          <DateAndMonthFilter onFilterChange={handleFilterChange} />
        </div>
      </div>
      <div className="mt-4">
        <Table
          guests={guests}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          currentPage={page}
        />
      </div>
    </div>
  );
};

export default Guest;

