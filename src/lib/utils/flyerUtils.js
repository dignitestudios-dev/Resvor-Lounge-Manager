export const MAX_SELECTED_FLYERS = 3;
export const MIN_SELECTED_FLYERS = 1;

export const EMPTY_FLYER_VALUES = {
  eventType: "",
  eventTitle: "",
  eventDate: "",
  eventStartTime: "",
  eventEndTime: "",
  address: "",
  city: "",
};

let flyerSeq = 0;

export const createFlyerId = (prefix = "flyer") => {
  flyerSeq += 1;
  return `${prefix}-${Date.now()}-${flyerSeq}`;
};

export const createFlyerItem = ({
  id,
  type = "predefined",
  templateId = null,
  title = "",
  imageUrl = null,
  imageFile = null,
  rawImageFile = null,
  values = {},
  editorContent = "",
} = {}) => ({
  id: id || createFlyerId(type),
  type,
  templateId: type === "predefined" ? templateId ?? null : null,
  title: title || (type === "custom" ? "Custom Flyer" : "Predefined Flyer"),
  imageUrl,
  imageFile,
  rawImageFile,
  values: { ...EMPTY_FLYER_VALUES, ...values },
  editorContent: editorContent || "",
});

export const hasFlyerOverlayData = (values = {}) =>
  Boolean(
    values?.eventTitle ||
      values?.eventDate ||
      values?.eventStartTime ||
      values?.eventEndTime ||
      values?.address ||
      values?.city
  );

export const formatTime12h = (time24) => {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return "";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

export const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const canAddMoreFlyers = (flyers = []) =>
  Array.isArray(flyers) && flyers.length < MAX_SELECTED_FLYERS;

export const isDuplicatePredefinedTemplate = (
  flyers = [],
  templateId,
  excludeFlyerId = null
) => {
  if (templateId === null || templateId === undefined) return false;
  return flyers.some(
    (f) =>
      f.id !== excludeFlyerId &&
      f.type === "predefined" &&
      String(f.templateId) === String(templateId)
  );
};

export const addFlyerToList = (flyers = [], newFlyer) => {
  if (!canAddMoreFlyers(flyers)) {
    return {
      ok: false,
      flyers,
      error: `You can select a maximum of ${MAX_SELECTED_FLYERS} flyers.`,
    };
  }

  if (
    newFlyer?.type === "predefined" &&
    isDuplicatePredefinedTemplate(flyers, newFlyer.templateId)
  ) {
    return {
      ok: false,
      flyers,
      error: "This predefined flyer is already selected.",
    };
  }

  return {
    ok: true,
    flyers: [...flyers, newFlyer],
    error: null,
  };
};

export const removeFlyerFromList = (flyers = [], flyerId) => {
  const nextFlyers = flyers.filter((f) => f.id !== flyerId);
  return {
    flyers: nextFlyers,
    nextActiveId: nextFlyers[0]?.id || null,
  };
};

export const validateFlyersSelection = async (flyers = [], schema = null) => {
  if (!Array.isArray(flyers) || flyers.length < MIN_SELECTED_FLYERS) {
    return {
      valid: false,
      error: "Please select at least 1 flyer.",
      invalidFlyerId: null,
      fieldErrors: {},
    };
  }

  if (flyers.length > MAX_SELECTED_FLYERS) {
    return {
      valid: false,
      error: `You can select a maximum of ${MAX_SELECTED_FLYERS} flyers.`,
      invalidFlyerId: null,
      fieldErrors: {},
    };
  }

  for (let i = 0; i < flyers.length; i += 1) {
    const flyer = flyers[i];
    if (!flyer.imageUrl && !flyer.imageFile) {
      return {
        valid: false,
        error: `Please upload or select an image for Flyer ${i + 1}.`,
        invalidFlyerId: flyer.id,
        fieldErrors: {},
      };
    }

    if (schema) {
      try {
        await schema.validate(flyer.values || EMPTY_FLYER_VALUES, {
          abortEarly: false,
        });
      } catch (validationError) {
        const fieldErrors = {};
        if (Array.isArray(validationError?.inner)) {
          validationError.inner.forEach((err) => {
            if (err.path && !fieldErrors[err.path]) {
              fieldErrors[err.path] = err.message;
            }
          });
        }
        return {
          valid: false,
          error: `Please fill all required event details for Flyer ${i + 1}.`,
          invalidFlyerId: flyer.id,
          fieldErrors,
        };
      }
    }
  }

  return {
    valid: true,
    error: null,
    invalidFlyerId: null,
    fieldErrors: {},
  };
};
