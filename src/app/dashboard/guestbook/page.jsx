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
import { Loader2, QrCode } from "lucide-react";
import GuestbookQRCodeSection from "@/components/guestbook/GuestbookQRCodeSection";

const Guest = () => {
  const [openForm, setOpenForm] = useState(false);
  const [showQRSection, setShowQRSection] = useState(true);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  // Pagination state
  const [page, setPage] = useState(1);

  // Date filter state — empty string means "no filter" (not sent to API)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: guestbookData, isLoading } = useGetGuestbook({
    page,
    search
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

      const csvText =
        data instanceof Blob ? await data.text() : data;

      const lines = csvText.split(/\r?\n/);

      const updatedCSV = lines.map((line, index) => {
        if (index === 0 || !line.trim()) return line;

        // CSV row ke quoted fields ko correctly parse karo
        const columns = [];
        let value = "";
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
              value += '"';
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === "," && !insideQuotes) {
            columns.push(value);
            value = "";
          } else {
            value += char;
          }
        }

        columns.push(value);

        // specialDates column index = 6
        try {
          const dates = JSON.parse(columns[6] || "[]");

          columns[6] = JSON.stringify(
            dates.map((item) => ({
              ...item,
              date: item.date
                ? String(item.date).slice(0, 10)
                : "",
            }))
          );
        } catch {
          return line;
        }

        // CSV escaping
        return columns
          .map((column) => {
            const escaped = String(column).replace(/"/g, '""');
            return /[",\n\r]/.test(escaped)
              ? `"${escaped}"`
              : escaped;
          })
          .join(",");
      });

      const blob = new Blob([updatedCSV.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `guestbook_${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      SuccessToast("Guestbook exported successfully!");
    } catch (error) {
      ErrorToast("Failed to export guestbook.");
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

          <Button
            variant={"outline"}
            className={"border-2 h-12 text-[14px] px-5 flex items-center gap-2"}
            onClick={() => setShowQRSection((prev) => !prev)}
            aria-expanded={showQRSection}
          >
            <QrCode className="w-4 h-4" />
            {showQRSection ? "Hide QR Code" : "Guestbook QR Code"}
          </Button>

          <AddGuestForm isOpen={openForm} onOpenChange={setOpenForm} />

          {/* <DateAndMonthFilter onFilterChange={handleFilterChange} /> */}
        </div>
      </div>
      {showQRSection && <GuestbookQRCodeSection />}
      <div className="bg-white p-2 rounded-md">
        <input
          type="text"
          placeholder="Search guests..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-12 w-full rounded-md border border-gray-300 px-4 text-sm outline-none focus:border-primary"
        />
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

