/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { RxCross2 } from "react-icons/rx";
import InputField from "../auth/InputField";
import { Button } from "../ui/button";
import { ErrorToast } from "../ui/toaster";
import DatePickerField from "./../common/DatePickerField";
import SelectField from "../common/SelectField";
import { eventTypeOptions } from "@/lib/constants";
import moment from "moment";
import { phoneFormatter, phoneToE164, formatCentsToUSD } from "@/lib/utils";
import PhoneInput from "../auth/PhoneInput";
import { useFormik } from "formik";
import { addEventSchema } from "@/lib/schema/event/addEventSchema";
import ServicesModal from "./ServicesModal";
import { useGetLounges } from "@/lib/hooks/queries/useLounges";

const stripCountryCode = (phone) => {
  if (!phone) return "";
  if (phone.startsWith("+1")) {
    return phone.slice(2).replace(/\D/g, "");
  }
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return cleaned.slice(1);
  }
  return cleaned;
};

const normalizeEventType = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  const aliasMap = {
    birthday_party: "birthday",
    birthday: "birthday",
    wedding: "wedding",
    engagement: "engagement",
    ceremony: "ceremony",
    meeting: "meeting",
    private_party: "private_party",
    "private party": "private_party",
    maintenance: "maintenance",
    closed: "closed",
    other: "other",
  };

  return aliasMap[normalized] || normalized;
};

const AddEventForm = ({ onClose, onNext, initialData }) => {
  const [servicesModalOpen, setServicesModalOpen] = useState(false);

  const { data: lounges = [] } = useGetLounges();
  const activeLoungeId = typeof window !== "undefined" ? localStorage.getItem("activeLoungeId") : null;
  const activeLounge = useMemo(() => {
    if (activeLoungeId) return lounges.find((l) => l._id === activeLoungeId) ?? lounges[0];
    return lounges[0] ?? null;
  }, [activeLoungeId, lounges]);

  const loungeServices = useMemo(() => {
    return (activeLounge?.services || []).map((s) => ({
      id: s._id || s.id,
      name: s.name,
      price: s.price,
      description: s.description || "",
      images: s.images || [],
    }));
  }, [activeLounge]);

  const formik = useFormik({
    initialValues: {
      eventType: initialData?.eventType || "",
      eventName: initialData?.eventName || "",
      description: initialData?.description || "",
      startDate: initialData?.startDateTime ? new Date(initialData.startDateTime) : null,
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
      guestName: initialData?.guestName || "",
      guestEmail: initialData?.guestEmail || "",
      guestPhone: stripCountryCode(initialData?.guestPhone) || "",
      guestCount: initialData?.guestCount !== undefined ? String(initialData.guestCount) : "",
      preferredMusic: initialData?.preferredMusic === "None" ? "" : (initialData?.preferredMusic || ""),
      specialRequest: initialData?.specialRequest === "None" ? "" : (initialData?.specialRequest || ""),
      budget: initialData?.budget !== undefined ? String(initialData.budget) : "",

      instructions: initialData?.instructions === "None" ? "" : (initialData?.instructions || ""),
      ticketAtDoor: initialData?.ticketAtDoor !== undefined ? (initialData.ticketAtDoor === true || initialData.ticketAtDoor === "true") : false,
      services: initialData?.services || [],
    },
    validationSchema: addEventSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Prepare startDateTime and endDateTime
      const startDateTime = new Date(values.startDate);
      const [startH, startM] = values.startTime.split(":");
      startDateTime.setHours(parseInt(startH), parseInt(startM));

      const endDateTime = new Date(values.startDate);
      const [endH, endM] = values.endTime.split(":");
      endDateTime.setHours(parseInt(endH), parseInt(endM));

      const eventData = {
        title: values.eventName,
        eventName: values.eventName,
        eventType: normalizeEventType(values.eventType),
        description: values.description || values.eventName,
        date: values.startDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
        startTime: values.startTime,
        endTime: values.endTime,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        guestPhone: phoneToE164(values.guestPhone),
        guestCount: Number(values.guestCount),
        preferredMusic: values.preferredMusic || "None",
        specialRequest: values.specialRequest || "None",
        budget: Number(values.budget),
        ticketAtDoor: values.ticketAtDoor === true || values.ticketAtDoor === "true",

        servicePackageIds: values.services ? values.services.map((s) => s.id) : [],
        services: values.services || [],
        instructions: values.instructions || "",
      };
      onNext(eventData);
    },
  });

  const handleSubmitClick = () => {
    formik.handleSubmit();
    if (!formik.isValid) {
      ErrorToast("Please fill all the required fields.");
    }
  };
  console.log("formik.isValid 131 ==> ", formik.errors)
  return (
    <div className="fixed inset-0 bg-[#0A150F80] bg-opacity-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-[12px] w-[440px] pb-2 h-[700px] overflow-y-scroll ">
        <div
          className={`flex justify-between items-center  px-8 pt-4 border-b-2 border-b-gray-300`}
        >
          <h2 className="text-[28px] font-bold mb-4">Request Event</h2>
          <div onClick={onClose} className="cursor-pointer">
            <RxCross2 className="text-[28px] text-[#181818]" />
          </div>
        </div>
        <div className="px-8 py-4">
          <div className=" mx-1">
            <SelectField
              label="Event Type"
              name="eventType"
              placeholder="Select Event Type"
              value={formik.values.eventType}
              onChange={(value) => formik.setFieldValue("eventType", value)}
              onBlur={() => formik.setFieldTouched("eventType", true)}
              error={formik.errors.eventType}
              touched={formik.touched.eventType}
              options={eventTypeOptions}
            />
          </div>
          <div className=" mx-1 pt-2">
            <InputField
              label="Event Name"
              text="eventName"
              placeholder="Event Name"
              type="text"
              id="eventName"
              name="eventName"
              maxLength={100}
              value={formik.values.eventName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.eventName}
              touched={formik.touched.eventName}
            />
          </div>
          <div className=" mx-1 pt-2">
            <InputField
              label="Description"
              text="description"
              placeholder="Event description"
              type="text"
              id="description"
              name="description"
              maxLength={100}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.description}
              touched={formik.touched.description}
            />
          </div>
          <div className="my-2 mx-1">
            <DatePickerField
              label="Select Date"
              minDate={moment().add(1, "day").startOf("day").toDate()}
              value={formik.values.startDate}
              onChange={(date) => {
                formik.setFieldValue("startDate", date);
                formik.setFieldTouched("startDate", true, false);
              }}
            />
            {formik.errors.startDate && formik.touched.startDate && (
              <p className="text-red-600 text-[12px] mt-1">
                {formik.errors.startDate}
              </p>
            )}
          </div>
          <div className="w-full flex items-center gap-2 my-2 px-1">
            <div className="w-full">
              <label className="block text-[14px] font-[500] text-[#181818] mb-2">
                Start Time
              </label>
              <input
                type="time"
                data-slot="input"
                name="startTime"
                className={`text-black w-full px-4 py-2 text-sm rounded-[15px] bg-white/10 backdrop-blur-[28.9px] ring-1 ${formik.errors.startTime && formik.touched.startTime ? "ring-red-500" : "ring-[#CACACA]"}
  focus:ring-2 focus:ring-gray-200 focus:outline-none  placeholder:font-light placeholder:text-[12px] placeholder:text-[#E6E6F0]
  `}
                value={formik.values.startTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.startTime && formik.touched.startTime && (
                <p className="text-red-600 text-[12px] mt-1">
                  {formik.errors.startTime}
                </p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-[14px] font-[500] text-[#181818] mb-2">
                End Time
              </label>
              <input
                type="time"
                data-slot="input"
                name="endTime"
                min={formik.values.startTime || undefined}
                className={`text-black w-full px-4 py-2 text-sm rounded-[15px] bg-white/10 backdrop-blur-[28.9px] ring-1 ${formik.errors.endTime && formik.touched.endTime ? "ring-red-500" : "ring-[#CACACA]"
                  } focus:ring-2 focus:ring-gray-200 focus:outline-none`}
                value={formik.values.endTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.endTime && formik.touched.endTime && (
                <p className="text-red-600 text-[12px] mt-1">
                  {formik.errors.endTime}
                </p>
              )}
            </div>
          </div>
          <div className="w-full flex items-center gap-2 my-2 px-1">
            <InputField
              label="Full Name"
              text="guestName"
              placeholder="Full Name"
              type="text"
              id="guestName"
              name="guestName"
              maxLength={100}
              value={formik.values.guestName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.guestName}
              touched={formik.touched.guestName}
            />
            <InputField
              label="Email address"
              text="guestEmail"
              placeholder="example@gmail.com"
              type="email"
              id="guestEmail"
              name="guestEmail"
              maxLength={60}
              value={formik.values.guestEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.guestEmail}
              touched={formik.touched.guestEmail}
            />
          </div>
          <div className="w-full flex items-center gap-2 my-2 px-1">
            <PhoneInput
              variant="light"
              label="Phone Number"
              value={phoneFormatter(formik.values.guestPhone || "")}
              id="guestPhone"
              name="guestPhone"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.guestPhone}
              touched={formik.touched.guestPhone}
              autoComplete="off"
            />

            <InputField
              label="Guest Count"
              text="guest"
              placeholder="Add here"
              type="text"
              id="guest"
              name="guestCount"
              maxLength={3}
              value={formik.values.guestCount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.guestCount}
              touched={formik.touched.guestCount}
            />
          </div>
          <div className="w-full flex items-center gap-2 my-2 px-1">
            <InputField
              label="Preferred Music Genre"
              text="music"
              placeholder="Add here"
              type="text"
              id="music"
              name="preferredMusic"
              maxLength={100}
              value={formik.values.preferredMusic}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <InputField
              label="Special Requests"
              text="special"
              placeholder="Add here"
              type="text"
              id="special"
              name="specialRequest"
              maxLength={100}
              value={formik.values.specialRequest}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="w-full flex items-center gap-2 my-2 px-1">
            <InputField
              label="Budget"
              text="budget"
              placeholder="Add here"
              type="text"
              id="budget"
              name="budget"
              maxLength={5}
              value={formik.values.budget}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.budget}
              touched={formik.touched.budget}
            />
            <div className="w-[70%]">
              <SelectField
                label="Ticket at Door"
                name="ticketAtDoor"
                placeholder="Select Option"
                value={formik.values.ticketAtDoor.toString()}
                onChange={(value) => formik.setFieldValue("ticketAtDoor", value === "true")}
                onBlur={() => formik.setFieldTouched("ticketAtDoor", true)}
                error={formik.errors.ticketAtDoor}
                touched={formik.touched.ticketAtDoor}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />
            </div>
          </div>
          <div className="w-full flex items-center gap-2 my-2 px-1">
            <InputField
              label="Instructions (optional)"
              text="instructions"
              placeholder="Special instructions"
              type="text"
              id="instructions"
              name="instructions"
              maxLength={250}
              value={formik.values.instructions}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.instructions}
              touched={formik.touched.instructions}
            />
          </div>

          {/* Select Services & Packages TagsField */}
          <div className="mx-1 pt-2 w-full">
            <label className="block text-[14px] font-[500] text-[#181818] mb-2">
              Select Services & Packages
            </label>
            <div
              className="flex items-center justify-between border border-gray-400 bg-white/10 backdrop-blur-[28.9px] text-sm rounded-[15px] overflow-hidden p-2.5 h-11"
            >
              <div className="flex flex-wrap p-1 text-[#727272] font-light text-[12px] select-none">
                Add Services and Packages
              </div>
              <button
                type="button"
                onClick={() => setServicesModalOpen(true)}
                className="bg-[#012C57] hover:bg-opacity-90 text-white p-1 rounded-xl transition cursor-pointer flex items-center justify-center"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 5a1 1 0 00-1 1v3H6a1 1 0 000 2h3v3a1 1 0 002 0V11h3a1 1 0 100-2h-3V6a1 1 0 00-1-1z" />
                </svg>
              </button>
            </div>
            {formik.errors.services && formik.touched.services && (
              <p className="text-red-600 text-[12px] mt-1">
                {formik.errors.services}
              </p>
            )}

            {formik.values.services && formik.values.services.length > 0 && (
              <div
                className="flex items-center border border-[#CACACA] text-sm rounded-[15px] overflow-hidden p-3 mt-2 w-full bg-gray-50"
              >
                <div className="flex flex-wrap gap-2 w-full text-white">
                  {formik.values.services.map((service) => (
                    <span
                      key={service.id}
                      className="bg-[#012C57] text-[12px] rounded-full px-3 py-1.5 inline-flex items-center gap-2 shadow-sm font-medium"
                    >
                      {service.title} ({formatCentsToUSD(service.price)})
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formik.values.services.filter(s => s.id !== service.id);
                          formik.setFieldValue("services", updated);
                          formik.setFieldTouched("services", true, false);
                        }}
                        className="text-white hover:text-red-400 focus:outline-none cursor-pointer flex items-center justify-center"
                      >
                        <RxCross2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ServicesModal
            isOpen={servicesModalOpen}
            onClose={() => setServicesModalOpen(false)}
            setServiceModalData={(data) => {
              formik.setFieldValue("services", data);
              formik.setFieldTouched("services", true, false);
            }}
            loungeServices={loungeServices}
            initialSelectedServices={formik.values.services}
          />

          <div>
            <div className="mt-4 px-1 w-full">
              <Button className={"w-full"} type="button" onClick={handleSubmitClick}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEventForm;
