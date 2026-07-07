import * as Yup from "yup";

const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const imageValidation = Yup.mixed()
  .test(
    "fileType",
    "Only JPG, JPEG, PNG and WEBP files are allowed",
    (value) => {
      if (!value || !value.type) return true;
      return SUPPORTED_FORMATS.includes(value.type);
    }
  )
  .test("fileSize", "Image size must be less than 5MB", (value) => {
    if (!value || !value.size) return true;
    return value.size <= 5 * 1024 * 1024;
  });

const nameValidation = Yup.string()
  .transform((value) => value?.trim())
  .test(
    "not-empty-after-trim",
    "Service name cannot be empty or just spaces.",
    (value) => !value || value.length > 0
  )
  .min(3, "Service name must be at least 3 characters")
  .max(50, "Service name must not exceed 50 characters");

const descriptionValidation = Yup.string()
  .transform((value) => value?.trim())
  .test(
    "not-empty-after-trim",
    "Description cannot be empty or just spaces.",
    (value) => !value || value.length > 0
  )
  .min(10, "Description must be at least 10 characters")
  .max(300, "Description must not exceed 300 characters");

const priceValidation = Yup.number()
  .typeError("Price must be a valid number")
  .positive("Price must be greater than 0");

export const serviceSchema = (isEdit = false) =>
  Yup.object({
    serviceName: isEdit
      ? nameValidation
      : nameValidation.required("Service name is required"),

    description: isEdit
      ? descriptionValidation
      : descriptionValidation.required("Description is required"),

    price: isEdit
      ? priceValidation
      : priceValidation.required("Price is required"),

    serviceImages: Yup.array()
      .of(imageValidation)
      .max(5, "Maximum 5 images are allowed"),
  });