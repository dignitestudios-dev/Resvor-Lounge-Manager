import * as Yup from "yup";

export const addGuestSchema = Yup.object({
  photo: Yup.mixed()
    .nullable()
    .test("fileType", "Only JPG, JPEG, PNG, WEBP files are allowed.", (value) => {
      if (!value || typeof value === "string") return true;
      return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(value.type);
    })
    .test("fileSize", "File size must be less than 5MB.", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= 5 * 1024 * 1024;
    }),

  firstName: Yup.string()
    .required("First name is required.")
    .min(1, "First name must be at least 1 character.")
    .max(50, "First name cannot exceed 50 characters.")
    .test(
      "not-empty-after-trim",
      "First name cannot be empty or only spaces.",
      (value) => (value ? value.trim().length > 0 : false),
    )
    .test(
      "no-leading-space",
      "First name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )
    .test(
      "no-multiple-spaces",
      "First name cannot contain multiple consecutive spaces.",
      (value) => (value ? !/ {2,}/.test(value) : true),
    )
    .matches(
      /^[\p{L}' -]+$/u,
      "First name can only contain letters, spaces, hyphens (-), and apostrophes (').",
    )
    .test("no-numbers", "First name cannot contain numbers.", (value) =>
      value ? !/\d/.test(value) : true,
    )
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
    ),

  lastName: Yup.string()
    .required("Last name is required.")
    .min(1, "Last name must be at least 1 character.")
    .max(50, "Last name cannot exceed 50 characters.")
    .test(
      "not-empty-after-trim",
      "Last name cannot be empty or only spaces.",
      (value) => (value ? value.trim().length > 0 : false),
    )
    .test(
      "no-leading-space",
      "Last name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )
    .test(
      "no-multiple-spaces",
      "Last name cannot contain multiple consecutive spaces.",
      (value) => (value ? !/ {2,}/.test(value) : true),
    )
    .matches(
      /^[\p{L}' -]+$/u,
      "Last name can only contain letters, spaces, hyphens (-), and apostrophes (').",
    )
    .test("no-numbers", "Last name cannot contain numbers.", (value) =>
      value ? !/\d/.test(value) : true,
    )
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
    ),

  email: Yup.string()
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
      /^[A-Za-z0-9_+-]+(?:\.[A-Za-z0-9_+-]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Invalid email format.",
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

  birthMonth: Yup.string().nullable(),

  phoneNumber: Yup.string()
    .required("Phone number is required.")
    .test("valid-phone", "Phone number must be at least 10 digits.", (value) => {
      if (!value) return false;
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }),

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

  specialDates: Yup.array()
    .of(
      Yup.object({
        title: Yup.string().test(
          "title-required",
          "Title is required when date is provided.",
          function (value) {
            const { date } = this.parent || {};
            if (date && !value?.trim()) return false;
            return true;
          },
        ),
        date: Yup.string().test(
          "date-required",
          "Date is required when title is provided.",
          function (value) {
            const { title } = this.parent || {};
            if (title?.trim() && !value) return false;
            return true;
          },
        ),
      }),
    )
    .nullable(),

  details: Yup.string()
    .nullable()
    .max(500, "Details cannot exceed 500 characters."),
});

