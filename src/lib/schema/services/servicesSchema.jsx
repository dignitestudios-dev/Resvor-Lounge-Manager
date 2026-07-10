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




  // const imageValidation = Yup.mixed()
  //   .test(
  //     "valid-image",
  //     "Only JPG, JPEG, PNG and WEBP files are allowed",
  //     (value) => {
  //       if (!value) return true;
  
  //       // Existing uploaded image
  //       if (value.isExisting || value.url) return true;
  
  //       // Newly uploaded file
  //       if (value.file) {
  //         return SUPPORTED_FORMATS.includes(value.file.type);
  //       }
  
  //       return false;
  //     }
  //   )
  //   .test("fileSize", "Image size must be less than 5MB", (value) => {
  //     if (!value || value.isExisting || !value.file) return true;
  //     return value.file.size <= 5 * 1024 * 1024;
  //   });

const nameValidation = Yup.string()
  .transform((value) => value?.trim())
  .test(
    "not-empty-after-trim",
    "Service name cannot be empty or just spaces.",
    (value) => !value || value.length > 0
  )
  .min(3, "Service name must be at least 3 characters")
  .max(100, "Service name must not exceed 100 characters");

const descriptionValidation = Yup.string()
  .transform((value) => value?.trim())
  .test(
    "not-empty-after-trim",
    "Description cannot be empty or just spaces.",
    (value) => !value || value.length > 0
  )
  .min(10, "Description must be at least 10 characters")
  .max(250, "Description must not exceed 250 characters");

const priceValidation = Yup.number()
  .typeError("Price must be a valid number")
  .positive("Price must be greater than 0")
  .max(1000, "Price cannot exceed 1000");

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
  .min(1, "At least one image is required")
  .required("Service image is required")
  .max(5, "Maximum 5 images are allowed"),
  });