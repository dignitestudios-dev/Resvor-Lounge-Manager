import * as Yup from "yup";

const validEventTypes = [
  "birthday",
  "wedding",
  "engagement",
  "ceremony",
  "meeting",
  "private_party",
  "maintenance",
  "closed",
  "other",
];

export const addEventSchema = Yup.object({
  eventType: Yup.string()
    .required("Event type is required.")
    .test("valid-event-type", "Please select a valid event type.", (value) => {
      if (!value) return false;
      const normalized = String(value)
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
      const mapped = aliasMap[normalized] || normalized;
      return validEventTypes.includes(mapped);
    }),

  eventName: Yup.string()
    .required("Event name is required.")
    .min(2, "Event name must be at least 2 characters.")
    .max(30, "Event name cannot exceed 30 characters.")
    .test(
      "not-empty-after-trim",
      "Event name cannot be empty or only spaces.",
      (value) => value?.trim().length > 0,
    )
    .test(
      "no-leading-space",
      "Event name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
    ),

  description: Yup.string()
    .max(100, "Description cannot exceed 100 characters.")
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
    ),

  startDate: Yup.date()
    .required("Date is required.")
    .nullable()
    .typeError("Please select a valid date."),

  startTime: Yup.string().required("Start time is required."),

  endTime: Yup.string()
    .required("End time is required.")
    .test(
      "is-after-start",
      "End time must be after start time.",
      function (value) {
        const { startTime } = this.parent;
        if (!startTime || !value) return true;
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${value}`);
        return end > start;
      },
    ),

  guestName: Yup.string()
    .required("Full name is required.")
    .min(1, "Full name must be at least 1 character.")
    .max(64, "Full name cannot exceed 64 characters.")
    .test(
      "not-empty-after-trim",
      "Full name cannot be empty or only spaces.",
      (value) => value?.trim().length > 0,
    )
    .test(
      "no-leading-space",
      "Full name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )
    .test(
      "no-multiple-spaces",
      "Full name cannot contain multiple consecutive spaces.",
      (value) => (value ? !/ {2,}/.test(value) : true),
    )
    .matches(
      /^[\p{L}' -]+$/u,
      "Full name can only contain letters, spaces, hyphens (-), and apostrophes (').",
    )
    .test("no-numbers", "Full name cannot contain numbers.", (value) =>
      value ? !/\d/.test(value) : true,
    )
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
    )
    .test(
      "sentence-case",
      "Each word must start with a capital letter.",
      (value) =>
        value
          ? value
              .trim()
              .split(" ")
              .every((word) => /^[A-ZÀ-Ÿ][\p{L}'-]*$/u.test(word))
          : true,
    ),

  guestEmail: Yup.string()
    .required("Email is required.")
    .test("no-leading-space", "Email cannot start with a space.", (value) =>
      value ? value[0] !== " " : false,
    )
    .test(
      "no-internal-or-trailing-space",
      "Email cannot contain spaces.",
      (value) => (value ? value.trim() === value && !/\s/.test(value) : false),
    )
    .matches(
      /^(?!.*\.\.)(?!.*\.$)[A-Za-z0-9][A-Za-z0-9._+-]*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Invalid email format.",
    ),

  guestPhone: Yup.string()
    .transform((value) => value.replace(/\D/g, ""))
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits.")
    .required("Phone number is required."),

  guestCount: Yup.string()
    .required("Guest count is required.")
    .test(
      "is-valid-number",
      "Enter a valid guest count.",
      (value) => value && !isNaN(value) && Number(value) > 0,
    ),

  preferredMusic: Yup.string().max(30, "Cannot exceed 30 characters."),

  specialRequest: Yup.string().max(30, "Cannot exceed 30 characters."),

  budget: Yup.string()
    .required("Budget is required.")
    .test(
      "is-valid-number",
      "Enter a valid budget amount.",
      (value) => value && !isNaN(value) && Number(value) > 0,
    ),

  preferredSeatingArea: Yup.string()
    .required("Preferred seating area is required.")
    .max(100, "Preferred seating area cannot exceed 100 characters."),

  instructions: Yup.string()
    .max(200, "Instructions cannot exceed 200 characters."),

  ticketAtDoor: Yup.boolean()
    .required("Ticket at door selection is required."),

  services: Yup.array().optional(),
});
