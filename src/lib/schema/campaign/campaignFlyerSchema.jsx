import * as Yup from "yup";

const validEventTypes = [
  "Concert",
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "Charity Gala",
  "Festival",
  "Product Launch",
  "Sports Event",
  "Networking Meetup",
  "Conference",
  "Workshop",
  "Exhibition",
  "Fundraiser",
  "Award Ceremony",
  "Community Fair",
];

export const campaignFlyerSchema = Yup.object({
  eventType: Yup.string()
    .required("Event type is required.")
    .oneOf(validEventTypes, "Please select a valid event type."),

  eventTitle: Yup.string()
    .required("Event title is required.")
    .min(2, "Event title must be at least 2 characters.")
    .max(100, "Event title cannot exceed 100 characters.")
    .test(
      "not-empty-after-trim",
      "Event title cannot be empty or only spaces.",
      (value) => value?.trim().length > 0,
    )
    .test(
      "no-leading-space",
      "Event title cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
    ),

  eventDate: Yup.string()
    .required("Event date is required.")
    .test(
      "is-tomorrow-or-later",
      "Date must be tomorrow or later.",
      (value) => {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const parts = value.split("-");
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const selDate = new Date(year, month, day);
          selDate.setHours(0, 0, 0, 0);
          return selDate > today;
        }
        return false;
      }
    ),

  eventStartTime: Yup.string().required("Start time is required."),

  eventEndTime: Yup.string()
    .required("End time is required.")
    .test(
      "is-after-start",
      "End time must be after start time.",
      function (value) {
        const { eventStartTime } = this.parent;
        if (!eventStartTime || !value) return true;
        const start = new Date(`2000-01-01T${eventStartTime}`);
        const end = new Date(`2000-01-01T${value}`);
        return end > start;
      },
    ),

  address: Yup.string()
    .required("Address is required.")
    .min(2, "Address must be at least 2 characters.")
    .max(200, "Address cannot exceed 200 characters.")
    .test(
      "not-empty-after-trim",
      "Address cannot be empty or only spaces.",
      (value) => value?.trim().length > 0,
    )
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
    ),

  city: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .optional()
    .min(2, "City must be at least 2 characters.")
    .max(60, "City cannot exceed 60 characters.")
    .test(
      "not-empty-after-trim",
      "City cannot be empty or only spaces.",
      (value) => (value === undefined ? true : value.trim().length > 0),
    )
    .test(
      "no-leading-space",
      "City cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )
    .test(
      "no-symbols-or-digits",
      "City can only contain letters and spaces.",
      (value) => (value ? /^[\p{L} ]+$/u.test(value) : true)
    )
    // Prevent HTML/script tags
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
    ),
});
