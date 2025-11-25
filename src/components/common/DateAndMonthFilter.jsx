"use client";
import React from "react";
import { FaFilter } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
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

const DateAndMonthFilter = ({ isLounge, onFilterChange }) => {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [selectedMonth, setSelectedMonth] = React.useState("");
  const [selectedLounge, setSelectedLounge] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange({
        startDate,
        endDate,
        selectedMonth,
        selectedLounge,
      });
    }
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setSelectedMonth("");
    setSelectedLounge("");
    if (onFilterChange) {
      onFilterChange({
        startDate: "",
        endDate: "",
        selectedMonth: "",
        selectedLounge: "",
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button className={"h-12 w-12 bg-gradient"}>
          <FaFilter className="h-6 w-6 min-h-6 min-w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <div className="flex gap-5 justify-between items-center border-b border-b-gray-200 pb-3">
          <p className="text-xl font-semibold">Filter</p>
          {/* <RxCross2 className="text-black text-2xl" /> */}
          <span />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mt-5">
          <div className="flex flex-col gap-1">
            <Label className={"text-base"}>Start Date</Label>
            <Input
              placeholder="Select Date"
              type={"date"}
              className={"w-40 h-14"}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className={"text-base"}>End Date</Label>
            <Input
              placeholder="Select Date"
              type={"date"}
              className={"w-40 h-14"}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <Label className={"text-base"}>Select Month</Label>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className={"w-full h-14!"}>
                <SelectValue placeholder="Select a Month" />
              </SelectTrigger>
              <SelectContent className={"h-[200px]"}>
                <SelectGroup>
                  <SelectLabel>Months</SelectLabel>
                  {months.map((month, index) => (
                    <SelectItem value={month} key={index}>
                      {utils.capitalize(month)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {isLounge && (
            <div className="col-span-2 flex flex-col gap-1">
              <Label className={"text-base"}>Select Lounge</Label>

              <Select value={selectedLounge} onValueChange={setSelectedLounge}>
                <SelectTrigger className={"w-full h-14!"}>
                  <SelectValue placeholder="Select a Lounge" />
                </SelectTrigger>
                <SelectContent className={"h-[200px]"}>
                  <SelectGroup>
                    <SelectLabel>Lounge</SelectLabel>
                    {locations.map((month) => (
                      <SelectItem value={month.name} key={month._id}>
                        {utils.capitalize(month.name)}
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
