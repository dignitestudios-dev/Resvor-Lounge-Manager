import * as Yup from "yup";

export const addShiftSchema = Yup.object({
  eventName: Yup.string()
    .optional(),

  eventId: Yup.string()
    .optional(),

  role: Yup.string()
    .required("Role is required.")
    .test(
      "not-empty-after-trim",
      "Role cannot be empty or only spaces.",
      (value) => value?.trim().length > 0
    ),

  date: Yup.string()
    .required("Date is required.")
    .test(
      "is-future-or-today",
      "Date must be today or a future date.",
      (value) => {
        if (!value) return false;
        const dateObj = new Date();
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const todayStr = `${yyyy}-${mm}-${dd}`;
        return value >= todayStr;
      }
    ),

  startTime: Yup.string()
    .required("Start time is required."),

  endTime: Yup.string()
    .required("End time is required.")
    .test(
      "is-after-start",
      "Start time must be before end time.",
      function (value) {
        const { startTime } = this.parent;
        if (!startTime || !value) return true;
        return value > startTime;
      }
    ),

  bartenderIds: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least 1 bartender.")
    .required("Please select at least 1 bartender."),

  instructions: Yup.string()
    .max(250, "Instructions cannot exceed 250 characters.")
    .optional(),
});
