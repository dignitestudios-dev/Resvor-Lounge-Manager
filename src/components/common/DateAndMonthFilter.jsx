"use client";
import React from "react";
import { FaFilter } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { locations, months } from "@/lib/constants";
import utils from "@/lib/utils";

const DateAndMonthFilter = ({
  isLounge,
  onFilterChange,
  statusOptions,
  initialValues = {},
}) => {
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState(initialValues?.startDate || "");
  const [endDate, setEndDate] = React.useState(initialValues?.endDate || "");
  const [selectedMonth, setSelectedMonth] = React.useState(initialValues?.selectedMonth || "");
  const [selectedLounge, setSelectedLounge] = React.useState(initialValues?.selectedLounge || "");
  const [selectedStatus, setSelectedStatus] = React.useState(initialValues?.selectedStatus || "");

  React.useEffect(() => {
    if (initialValues) {
      setStartDate(initialValues.startDate || "");
      setEndDate(initialValues.endDate || "");
      setSelectedMonth(initialValues.selectedMonth || "");
      setSelectedLounge(initialValues.selectedLounge || "");
      setSelectedStatus(initialValues.selectedStatus || "");
    }
  }, [
    initialValues?.startDate,
    initialValues?.endDate,
    initialValues?.selectedMonth,
    initialValues?.selectedLounge,
    initialValues?.selectedStatus,
  ]);

  const hasActiveFilters = Boolean(
    startDate || endDate || selectedMonth || selectedLounge || selectedStatus
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange({
        startDate,
        endDate,
        selectedMonth,
        selectedLounge,
        selectedStatus,
      });
    }
    setOpen(false);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setSelectedMonth("");
    setSelectedLounge("");
    setSelectedStatus("");
    if (onFilterChange) {
      onFilterChange({
        startDate: "",
        endDate: "",
        selectedMonth: "",
        selectedLounge: "",
        selectedStatus: "",
      });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className={"h-12 w-12 bg-gradient relative cursor-pointer"}>
          <FaFilter className="h-6 w-6 min-h-6 min-w-6" />
          {hasActiveFilters && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-yellow-400 ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <div className="flex gap-5 justify-between items-center border-b border-b-gray-200 pb-3">
          <p className="text-xl font-semibold">Filter</p>
          <PopoverClose asChild>
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
              <RxCross2 className="h-5 w-5" />
            </button>
          </PopoverClose>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mt-5">
          <div className="flex flex-col gap-1">
            <Label className={"text-base"}>Start Date</Label>
            <Input
              placeholder="Select Date"
              type={"date"}
              className={"w-40 h-14"}
              value={startDate}
              onChange={(e) => {
                const newStart = e.target.value;
                setStartDate(newStart);
                if (endDate && endDate < newStart) {
                  setEndDate("");
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className={"text-base"}>End Date</Label>
            <Input
              placeholder="Select Date"
              type={"date"}
              className={"w-40 h-14"}
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {statusOptions && statusOptions.length > 0 && (
            <div className="col-span-2 flex flex-col gap-1">
              <Label className={"text-base"}>Select Status</Label>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className={"w-full h-14!"}>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent className={"h-[200px]"}>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    {statusOptions.map((status, index) => (
                      <SelectItem value={status} key={index}>
                        {utils.capitalize(status.replaceAll("_", " "))}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            className={"h-14!"}
            variant={"secondary"}
            type="button"
            onClick={handleClear}
          >
            Clear
          </Button>

          <Button className={"h-14!"} type="submit">
            Apply
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default DateAndMonthFilter;
