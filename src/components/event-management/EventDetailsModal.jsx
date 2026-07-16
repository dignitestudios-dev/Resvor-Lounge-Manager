/* eslint-disable react/prop-types */
import { RxCross2 } from "react-icons/rx";
import { Button } from "../ui/button";


const EventDetailsModal = ({
  onClose,
  eventData,
  serviceData,
  onClickBack,
  onClick,
  isLoading = false,
}) => {

  const {
    eventType = "Birthday Party",
    date = "26 Dec, 2024",
    startTime = "06:00 PM",
    endTime = "06:00 PM",
    name = "Mike Smith",
    email = "designer@gmail.com",
    phone = "1 462 849 558",
    guestCount = "30 Guests",
    preferredMusic = "Hip Hop, R&B, Rock",
    specialRequest = "Birthday Signage",
    budget = "$1000",
    ticketAtDoor = "None",
    guestName,
    guestEmail,
    guestPhone,
    preferredSeatingArea = "",
    instructions = "",
    services = [],
  } = eventData || {};

  const displayTicketAtDoor = typeof ticketAtDoor === "boolean" ? (ticketAtDoor ? "Yes" : "No") : (ticketAtDoor || "None");
  const displayName = guestName || name;
  const displayEmail = guestEmail || email;
  const displayPhone = guestPhone || phone;

  return (
    <div className="fixed inset-0 bg-[#0A150F80] bg-opacity-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-[12px] w-[440px] pb-2 h-[650px] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-4 border-b-2 border-b-gray-300">
          <h2 className="text-[28px] font-bold mb-4">Event Details</h2>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer"
          >
            <RxCross2 className="text-[28px] text-[#181818]" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Booking Overview Section */}
          <div className="mb-6">
            <h3 className="text-[16px] font-semibold text-[#181818] mb-3">
              Booking Overview
            </h3>
            <div className="grid grid-cols-4 gap-3 text-[12px] border-b-2 border-b-gray-300 pb-2">
              <div className="min-w-0">
                <p className="font-semibold text-[#000000] mb-1">Event Type</p>
                <p className="text-[#000000] break-words">{eventType}</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">Date</p>
                <p className="text-[#000000] break-words">{date}</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">Start Time</p>
                <p className="text-[#000000] break-words">{startTime}</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">End Time</p>
                <p className="text-[#000000] break-words">{endTime}</p>
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-3 text-[12px] border-b-2 border-b-gray-300 pb-2">
              <div className="min-w-0">
                <p className="font-semibold text-[#000000] mb-1">Name</p>
                <p className="text-[#000000] break-words">{displayName}</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">
                  Email Address
                </p>
                <p className="text-[#000000] break-all">{displayEmail}</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">
                  Phone Number
                </p>
                <p className="text-[#000000] break-words">{displayPhone}</p>
              </div>
            </div>
          </div>

          {/* Guest & Preferences Section */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-3 text-[12px] border-b-2 border-b-gray-300 pb-2">
              <div className="min-w-0">
                <p className="font-semibold text-[#000000] mb-1">Guest Count</p>
                <p className="text-[#000000] break-words">{guestCount}</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">
                  Preferred Music
                </p>
                <p className="text-[#000000] break-words">{preferredMusic}</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">
                  Special Request
                </p>
                <p className="text-[#000000] break-words">{specialRequest}</p>
              </div>
            </div>
          </div>

          {/* Services & Budget Section */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3 text-[12px] border-b-2 border-b-gray-300 pb-2">
              <div className="min-w-0">
                <p className="font-semibold text-[#000000] mb-1">
                  Services and Packages
                </p>

                {serviceData?.selectedPackage && serviceData.selectedPackage.length > 0 ? (
                  serviceData.selectedPackage.map((item) => (
                    <p key={item.id} className="text-[#000000] break-words">
                      {item.title} - {item.price}$
                    </p>
                  ))
                ) : (
                  services &&
                  services.map((item) => (
                    <p key={item.id} className="text-[#000000] break-words">
                      {item.title} - {item.price}$
                    </p>
                  ))
                )}
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">
                  Preferred Seating Area
                </p>
                {serviceData?.selectedSeating?.map((item, index) => (
                  <p key={index} className="text-[#000000] break-words">
                    {item.name}
                  </p>
                ))}
                {(!serviceData?.selectedSeating || serviceData.selectedSeating.length === 0) && preferredSeatingArea && (
                  <p className="text-[#000000] break-words">{preferredSeatingArea}</p>
                )}
              </div>
            </div>
          </div>

          {/* Budget & Ticket Section */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3 text-[12px] border-b-2 border-b-gray-300 pb-2">
              <div className="min-w-0">
                <p className="font-semibold text-[#000000] mb-1">Budget</p>
                <p className="text-[#000000] break-words">{budget}</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-2 min-w-0">
                <p className="font-semibold text-[#000000] mb-1">
                  Ticket at Door{" "}
                  <span className="text-[#727272]">(Optional)</span>
                </p>
                <p className="text-[#000000] break-words">{displayTicketAtDoor}</p>
              </div>
            </div>
          </div>

          {(serviceData?.instruction || instructions) && (
            <div className="mb-6">
              <p className="font-semibold text-[#000000] mb-1">
                Any Instruction{" "}
                <span className="text-[#727272] text-[11px]">(optional)</span>
              </p>
              <p className="text-[#000000] text-[12px] leading-5 break-words">
                {serviceData?.instruction || instructions}
              </p>
            </div>
          )}

          {/* Lounge Selector */}
          {/* <div className="mb-6">
            <label className="block text-[14px] font-semibold text-[#000000] mb-2">
              Select Lounge <span className="text-red-500">*</span>
            </label>
            <Select value={selectedLoungeId} onValueChange={onLoungeSelect}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select a Lounge" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Lounge</SelectLabel>
                  {lounges?.length > 0 ? (
                    lounges?.map((lounge) => (
                      <SelectItem
                        className="text-black"
                        value={lounge._id}
                        key={lounge._id}
                      >
                        {lounge.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="">
                      No lounges available
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div> */}
          <div className="space-y-2 mt-8 w-full">
            <Button
              className={"w-full"}
              type="button"
              onClick={onClick}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
            <button
              onClick={onClickBack}
              disabled={isLoading}
              className="w-full bg-[#E8E8E8] text-[#181818] text-[14px] rounded-[8px] py-2 font-semibold hover:bg-[#D8D8D8] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
