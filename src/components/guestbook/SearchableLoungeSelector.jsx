"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, RefreshCw, Building2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * SearchableLoungeSelector
 *
 * Allows a guest to search and select an active lounge.
 * Starts with no selected lounge.
 */
const SearchableLoungeSelector = ({
  lounges = [],
  selectedLoungeId = "",
  onSelectLounge,
  isLoading = false,
  isError = false,
  onRetry,
  errorMessage = "",
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [failedLogos, setFailedLogos] = useState({});
  const searchInputRef = useRef(null);

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  const selectedLounge = useMemo(() => {
    if (!selectedLoungeId) return null;
    return lounges.find((l) => l._id === selectedLoungeId) || null;
  }, [lounges, selectedLoungeId]);

  const filteredLounges = useMemo(() => {
    if (!searchQuery.trim()) return lounges;
    const query = searchQuery.toLowerCase().trim();
    return lounges.filter((lounge) => {
      const nameMatch = lounge.name?.toLowerCase().includes(query);
      const addressMatch = lounge.location?.address
        ?.toLowerCase()
        .includes(query);
      return Boolean(nameMatch || addressMatch);
    });
  }, [lounges, searchQuery]);

  const handleSelect = (lounge) => {
    onSelectLounge(lounge._id, lounge);
    setOpen(false);
  };

  const handleImageError = (id) => {
    setFailedLogos((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label
        id="lounge-selector-label"
        className="text-sm font-semibold text-gray-900 flex items-center justify-between"
      >
        <span>
          Select Lounge <span className="text-red-500">*</span>
        </span>
        {selectedLounge && (
          <span className="text-xs text-primary font-medium">Selected</span>
        )}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-labelledby="lounge-selector-label"
            aria-invalid={Boolean(errorMessage)}
            className={`w-full flex items-center justify-between min-h-13 px-3.5 py-2.5 rounded-xl border bg-white text-left transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 ${
              errorMessage
                ? "border-red-400 focus:border-red-500 ring-2 ring-red-100"
                : "border-gray-300 hover:border-gray-400 focus:border-primary"
            }`}
          >
            {selectedLounge ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                  {selectedLounge.logo?.location &&
                  !failedLogos[selectedLounge._id] ? (
                    <img
                      src={selectedLounge.logo.location}
                      alt={selectedLounge.name || "Lounge logo"}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(selectedLounge._id)}
                    />
                  ) : (
                    <span className="text-xs font-bold text-white bg-primary w-full h-full flex items-center justify-center">
                      {selectedLounge.name?.charAt(0)?.toUpperCase() || "L"}
                    </span>
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {selectedLounge.name}
                  </span>
                  {selectedLounge.location?.address && (
                    <span className="text-xs text-gray-500 truncate">
                      {selectedLounge.location.address}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-gray-400">
                <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm">Choose a lounge you are visiting...</span>
              </div>
            )}

            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                open ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) max-w-md p-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
        >
          {/* Search bar inside popover */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search lounge by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-colors"
              aria-label="Search lounge by name or address"
            />
          </div>

          {/* List contents */}
          <div
            role="listbox"
            className="max-h-64 overflow-y-auto space-y-1 pr-0.5"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin text-primary mb-2" />
                <p className="text-sm font-medium">Loading active lounges...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                <p className="text-sm text-red-600 font-medium mb-2">
                  Failed to load lounges.
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                )}
              </div>
            ) : lounges.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-500 text-sm">
                No lounges are currently available.
              </div>
            ) : filteredLounges.length === 0 ? (
              <div className="py-6 px-4 text-center text-gray-400 text-sm">
                No lounges match &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredLounges.map((lounge) => {
                const isSelected = lounge._id === selectedLoungeId;
                const hasLogo =
                  lounge.logo?.location && !failedLogos[lounge._id];

                return (
                  <button
                    key={lounge._id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(lounge)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#E8E8FF] text-primary"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {hasLogo ? (
                        <img
                          src={lounge.logo.location}
                          alt={lounge.name || "Lounge logo"}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(lounge._id)}
                        />
                      ) : (
                        <span className="text-xs font-bold text-white bg-primary w-full h-full flex items-center justify-center">
                          {lounge.name?.charAt(0)?.toUpperCase() || "L"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate">
                        {lounge.name}
                      </span>
                      {lounge.location?.address && (
                        <span className="text-xs text-gray-500 truncate">
                          {lounge.location.address}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {errorMessage && (
        <p className="text-xs text-red-500 mt-0.5">{errorMessage}</p>
      )}
    </div>
  );
};

export default SearchableLoungeSelector;

