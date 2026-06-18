/* eslint-disable react/prop-types */

import AuthButton from "../auth/AuthButton";
import { useFormik } from "formik";
import { LogOutIcon, Upload } from "lucide-react";
import { personalDetailsRemainingValues } from "@/lib/init/personalDetailsRemainingValues";
import { personalDetailsRemainingSchema } from "@/lib/schema/onboarding/personalDetailsRemainingSchema";
import { ErrorToast } from "../ui/toaster";
import { validateImageResolution } from "@/lib/utils";
import AddServicesAndPackages from "./Servicespackages";

const PersonalDetailsRemaining = ({
  handleNext,
  handlePrevious,
  previousData = {},
}) => {
  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    initialValues: personalDetailsRemainingValues(previousData),
    validationSchema: personalDetailsRemainingSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        // Pass combined data to parent component
        handleNext(values);
      } catch (error) {
        if (error.code === "NO_INTERNET") {
          ErrorToast(error.message);
        } else {
          ErrorToast(
            error.response?.data?.message ||
              "An error occurred during logout. Please try again.",
          );
        }
      }
    },
  });

  const handleMultipleImagesChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Existing images
    const existingImages = values.images || [];

    // Max 5 images validation
    if (existingImages.length + selectedFiles.length > 5) {
      ErrorToast("Maximum 5 images are allowed");
      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      // File type validation
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        ErrorToast(`${file.name}: Only JPEG and PNG formats are allowed`);
        continue;
      }

      // File size validation (10MB)
      if (file.size > 10 * 1024 * 1024) {
        ErrorToast(`${file.name}: File size must not exceed 10MB`);
        continue;
      }

      // Resolution validation
      const isValidResolution = await validateImageResolution(file);

      if (!isValidResolution) {
        ErrorToast(`${file.name}: Image resolution must be at least 215x215`);
        continue;
      }

      validFiles.push(file);
    }

    // Merge previous + new images
    setFieldValue("images", [...existingImages, ...validFiles]);

    // Reset input value so same image can be selected again
    e.target.value = "";
  };

  return (
    <div className="flex flex-col justify-center items-center h-auto ">
      <div className="flex justify-end absolute top-20 w-[600px]">
        <button
          className="group relative bg-white rounded-md p-2 cursor-po inter"
          type="button"
          onClick={() => handlePrevious()}
        >
          {/* Tooltip text */}
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 scale-0 rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
            Logout
          </span>

          <LogOutIcon color="black" size={24} />
        </button>
      </div>
      <div className="mt-4 xxl:w-[400px] xl:w-[450px] xxl:ml-12 text-center space-y-4">
        <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
          Enter Your Lounge <br /> Details
        </p>
        <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]/80">
          Please enter your lounge details.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[450px] md:w-[550px] w-[320px] mt-10">
          <div className="mt-4 grid grid-cols-1 gap-4 items-start">
            <div>
              <label className="text-[14px] font-medium text-white block mb-1">
                Lounge Specialization
              </label>
              <textarea
                name="specialization"
                id="specialization"
                value={values.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Lounge Specialization"
                className="w-full h-20 rounded-[12px] border-2 border-white bg-white/10 placeholder:text-gray-400 text-[#E6E6F0] p-3"
              />
              {touched.specialization && errors.specialization && (
                <p className="text-red-600 text-xs mt-0">
                  {errors.specialization}
                </p>
              )}
            </div>

            <AddServicesAndPackages
              services={values.services}
              onChange={(updatedServices) =>
                setFieldValue("services", updatedServices)
              }
            />

            <div>
              <label className="text-[14px] font-medium text-white block mb-1">
                Upload Lounge Images
              </label>
              <div className="w-full h-[70px] rounded-[12px] border-2 border-dashed border-white/30 bg-white/10 flex items-center justify-center relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleMultipleImagesChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center text-white/70 flex flex-col items-center gap-2">
                  <Upload />
                  <p>Choose file to upload</p>
                </div>
              </div>
              {values.images && values.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {values.images.map((f, i) => (
                    <div key={i} className="relative">
                      <img
                        src={typeof f === "string" ? f : URL.createObjectURL(f)}
                        alt={`img-${i}`}
                        className="w-16 h-12 object-cover rounded"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const updatedImages = values.images.filter(
                            (_, index) => index !== i,
                          );

                          setFieldValue("images", updatedImages);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {touched.images && errors.images && (
                <p className="text-red-600 text-xs mt-1.5">{errors.images}</p>
              )}
            </div>

            <div>
              <label className="text-[14px] font-medium text-white block mb-1">
                Lounge Description
              </label>
              <textarea
                name="description"
                id="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe Your Business"
                className="w-full h-20 rounded-[12px] border-2 border-white bg-white/10 placeholder:text-gray-400 text-[#E6E6F0] p-3"
              />
              {touched.description && errors.description && (
                <p className="text-red-600 text-xs mt-0">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 ">
          <div className="xxl:w-[650px] w-[450px] mt-1 mb-4">
            <AuthButton
              text={"Next"}
              // disabled={Object.keys(errors).length > 0}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetailsRemaining;
