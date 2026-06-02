/* eslint-disable react/prop-types */

import AuthButton from "../auth/AuthButton";
import { useFormik } from "formik";
import { Upload } from "lucide-react";
import { personalDetailsRemainingValues } from "@/lib/init/personalDetailsRemainingValues";
import { personalDetailsRemainingSchema } from "@/lib/schema/onboarding/personalDetailsRemainingSchema";
import { ErrorToast } from "../ui/toaster";

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
        console.log("🚀 ~ PersonalDetailsRemaining ~ combined values:", values);
        // Pass combined data to parent component
        handleNext(values);
      } catch (error) {
        console.error(error);
        ErrorToast(error.message || "An error occurred. Please try again.");
      }
    },
  });
  return (
    <div className="flex flex-col justify-center items-center h-auto ">
      {/* <div className="flex justify-start items-center absolute top-12 left-0">
        <button type="button" onClick={() => handlePrevious()}>
          <FaArrowLeftLong color="white" size={24} />
        </button>
      </div> */}
      <div className="mt-4 xxl:w-[400px] xxl:ml-12 text-center space-y-4">
        <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
          Enter Your Lounge Details
        </p>
        <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]/80">
          Please enter your lounge details.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px] mt-10">
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
                placeholder="Enter Details"
                className="w-full h-20 rounded-[12px] border-2 border-white bg-white/10 placeholder:text-gray-400 text-[#E6E6F0] p-3"
              />
              {touched.specialization && errors.specialization && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.specialization}
                </p>
              )}
            </div>

            <div>
              <label className="text-[14px] font-medium text-white block mb-1">
                Upload Lounge Images
              </label>
              <div className="w-full h-[70px] rounded-[12px] border-2 border-dashed border-white/30 bg-white/10 flex items-center justify-center relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFieldValue("images", files);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center text-white/70 flex flex-col items-center gap-2">
                  <Upload />
                  <p>choose file to upload</p>
                </div>
              </div>
              {values.images && values.images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {values.images.map((f, i) => (
                    <img
                      key={i}
                      src={typeof f === "string" ? f : URL.createObjectURL(f)}
                      alt={`img-${i}`}
                      className="w-16 h-12 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              {touched.images && errors.images && (
                <p className="text-red-600 text-xs mt-1">{errors.images}</p>
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
                placeholder="Describe your business"
                className="w-full h-20 rounded-[12px] border-2 border-white bg-white/10 placeholder:text-gray-400 text-[#E6E6F0] p-3"
              />
              {touched.description && errors.description && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 ">
          <div className="xxl:w-[650px] w-[350px] mt-1 mb-4">
            <AuthButton
              text={"Next"}
              disabled={Object.keys(errors).length > 0}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetailsRemaining;
