import * as Yup from "yup";

export const publicGuestbookSchema = Yup.object().shape({
  loungeId: Yup.string()
    .trim()
    .required("Please select the lounge you are visiting."),

  firstName: Yup.string()
    .required("First name is required.")
    .test(
      "not-empty-after-trim",
      "First name cannot be empty or only spaces.",
      (value) => Boolean(value && value.trim().length > 0)
    )
    .max(100, "First name cannot exceed 100 characters."),

  lastName: Yup.string()
    .required("Last name is required.")
    .test(
      "not-empty-after-trim",
      "Last name cannot be empty or only spaces.",
      (value) => Boolean(value && value.trim().length > 0)
    )
    .max(100, "Last name cannot exceed 100 characters."),

  email: Yup.string()
    .required("Email address is required.")
    .test(
      "no-leading-space",
      "Email cannot start with a space.",
      (value) => (value ? value[0] !== " " : false)
    )
    .matches(
      /^[A-Za-z0-9_+-]+(?:\.[A-Za-z0-9_+-]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Please enter a valid email address."
    ),

  company: Yup.string().nullable().max(100, "Company cannot exceed 100 characters."),

  title: Yup.string().nullable().max(100, "Title cannot exceed 100 characters."),

  website: Yup.string()
    .nullable()
    .test("valid-url", "Please enter a valid website URL.", (value) => {
      if (!value || !value.trim()) return true;
      return /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(value.trim());
    }),

  nickname: Yup.string().nullable().max(50, "Nickname cannot exceed 50 characters."),

  phoneNumber: Yup.string()
    .required("Phone number is required.")
    .test(
      "valid-phone",
      "Phone number must be at least 10 digits.",
      (value) => {
        if (!value) return false;
        const digits = value.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      }
    ),

  address: Yup.object({
    street: Yup.string().nullable().max(150, "Street cannot exceed 150 characters."),
    state: Yup.string().nullable(),
    city: Yup.string()
      .nullable()
      .test(
        "city-required-when-state-selected",
        "City is required when a State is selected.",
        function (value) {
          const { state } = this.parent || {};
          if (state && String(state).trim()) {
            return Boolean(value && String(value).trim());
          }
          return true;
        }
      ),
    zip: Yup.string().nullable().max(20, "ZIP code cannot exceed 20 characters."),
    country: Yup.string().nullable(),
  }).nullable(),

  socialNetwork: Yup.object({
    facebook: Yup.string()
      .nullable()
      .test("valid-facebook-url", "Please enter a valid Facebook URL.", (value) => {
        if (!value || !value.trim()) return true;
        return /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(value.trim());
      }),
    twitter: Yup.string()
      .nullable()
      .test("valid-twitter-url", "Please enter a valid Twitter/X URL.", (value) => {
        if (!value || !value.trim()) return true;
        return /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(value.trim());
      }),
    linkedin: Yup.string()
      .nullable()
      .test("valid-linkedin-url", "Please enter a valid LinkedIn URL.", (value) => {
        if (!value || !value.trim()) return true;
        return /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(value.trim());
      }),
    instagram: Yup.string()
      .nullable()
      .test("valid-instagram-url", "Please enter a valid Instagram URL.", (value) => {
        if (!value || !value.trim()) return true;
        return /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(value.trim());
      }),
  }).nullable(),

  birthMonth: Yup.mixed()
    .nullable()
    .test(
      "valid-month",
      "Birth month must be between 1 and 12.",
      (value) => {
        if (value === null || value === undefined || value === "") return true;
        const num = Number(value);
        return Number.isInteger(num) && num >= 1 && num <= 12;
      }
    ),

  photo: Yup.mixed()
    .nullable()
    .test(
      "fileType",
      "Only JPG, JPEG, PNG, and WEBP images are allowed.",
      (value) => {
        if (!value || typeof value === "string") return true;
        return [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ].includes(value.type);
      }
    )
    .test("fileSize", "Photo must be less than 5 MB.", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= 5 * 1024 * 1024;
    }),

  specialDates: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string().test(
          "title-required",
          "Title is required for special date.",
          function (value) {
            const { date } = this.parent || {};
            // If date is present or title is partially filled, title is required
            if ((date && date.trim()) || (value && value.trim())) {
              return Boolean(value && value.trim().length > 0);
            }
            return true;
          }
        ),
        date: Yup.string().test(
          "date-required",
          "Date is required for special date.",
          function (value) {
            const { title } = this.parent || {};
            // If title is present or date is partially filled, date is required
            if ((title && title.trim()) || (value && value.trim())) {
              return Boolean(value && value.trim().length > 0);
            }
            return true;
          }
        ),
      })
    )
    .nullable(),

  details: Yup.string()
    .nullable()
    .max(500, "Details cannot exceed 500 characters."),
});

