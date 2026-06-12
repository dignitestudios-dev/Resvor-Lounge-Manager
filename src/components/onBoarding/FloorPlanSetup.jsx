/* eslint-disable react/prop-types */

import AuthButton from "../auth/AuthButton";
import { useFormik } from "formik";
import AuthInput from "../auth/AuthInput";
import { FaArrowLeftLong } from "react-icons/fa6";
import { floorPlanSetupValues } from "@/lib/init/floorPlanSetupValues";
import { floorPlanSetupSchema } from "@/lib/schema/onboarding/floorPlanSetupSchema";
import { ErrorToast } from "../ui/toaster";
import { useCreateLounge } from "@/lib/hooks/mutations/OnBoardingMutations";
import { validateImageResolution } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const FloorPlanSetup = ({ handlePrevious, combinedData = {} }) => {
  const createLoungeMutation = useCreateLounge();
  const queryClient = useQueryClient();
  const handleTablesChange = (e) => {
    const { name, value } = e.target;
    // Keep digits only
    let sanitizedValue = value.replace(/\D/g, "");
    // Restrict max value
    if (Number(sanitizedValue) > 999) {
      sanitizedValue = "999";
    }
    setFieldValue(name, sanitizedValue);
  };

  const { values, handleBlur, handleSubmit, errors, touched, setFieldValue } =
    useFormik({
      initialValues: floorPlanSetupValues(combinedData),
      validationSchema: floorPlanSetupSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        try {
          // Submit combined data to API
          const response = await createLoungeMutation.mutateAsync(values);
          updateAuthCache(queryClient, {
            sessionType: response?.data?.tokenType,
            onboardingStep: "completed",
          });
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

  const handleFloorPlanChange = async (e) => {
    const file = e.currentTarget.files?.[0];

    if (file) {
      // JPEG/PNG validation
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        ErrorToast("Only JPEG and PNG formats are allowed");
        return;
      }

      // 10MB validation
      if (file.size > 10 * 1024 * 1024) {
        ErrorToast("File size must not exceed 10MB");
        return;
      }

      // Resolution validation
      const isValidResolution = await validateImageResolution(file);

      if (!isValidResolution) {
        ErrorToast("Image resolution must be at least 215x215");
        return;
      }

      setFieldValue("floorPlan", file);

      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-auto">
      <div className="flex justify-end absolute top-20 w-[600px]">
        <button
          className="group relative bg-white rounded-md p-2 cursor-pointer"
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
      <div className="mt-4 xxl:w-[400px] xxl:ml-12 text-center space-y-4">
        <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
          Set Up Your <br />
          Lounge Floor Plan
        </p>
        <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]">
          Upload your lounge&apos;s floor plan to give guests <br /> seating
          experience.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[450px] md:w-[550px] w-[320px] mt-10">
          {/* Floor Plan Upload */}
          {/* Floor Plan Upload */}
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-white block">
              Upload Floor Plan
            </label>

            <div className="relative w-full h-[220px] rounded-[20px] overflow-hidden border-2 border-dashed border-white/30 bg-white/10">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFloorPlanChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />

              {values.floorPlan ? (
                <>
                  <img
                    src={
                      typeof values.floorPlan === "string"
                        ? values.floorPlan
                        : URL.createObjectURL(values.floorPlan)
                    }
                    alt="Floor Plan Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex flex-col items-center justify-center text-white z-10">
                    <div className="text-2xl mb-2">+</div>
                    <p className="underline text-sm">
                      Click to change floor plan
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/70">
                  <div className="text-2xl mb-2">+</div>
                  <p className="underline">Upload Floor Plan</p>
                </div>
              )}
            </div>

            {touched.floorPlan && errors.floorPlan && (
              <p className="text-red-600 text-xs">{errors.floorPlan}</p>
            )}
          </div>

          {/* Floor Plan Preview */}
          {/* {values.floorPlan && (
            <div className="rounded-[20px] border-2 border-white/20 bg-white/5 backdrop-blur p-4">
              <p className="text-white font-[500] mb-3">Floor Plan Preview</p>
              <img
                src={
                  typeof values.floorPlan === "string"
                    ? values.floorPlan
                    : URL.createObjectURL(values.floorPlan)
                }
                alt="floor plan preview"
                className="w-full h-[200px] object-cover rounded-lg"
              />
            </div>
          )} */}

          {/* Regular Tables */}
          <div className="mt-4">
            <AuthInput
              label={"Regular Tables"}
              text={"regularTables"}
              placeholder={"Enter number of tables"}
              type={"text"}
              id={"regularTables"}
              name={"regularTables"}
              value={values.regularTables}
              onChange={handleTablesChange}
              onBlur={handleBlur}
              error={errors?.regularTables}
              touched={touched?.regularTables}
              maxLength={3}
            />
          </div>

          {/* VIP Tables */}
          <div className="mt-4">
            <AuthInput
              label={"VIP Tables"}
              text={"vipTables"}
              placeholder={"Enter number of VIP tables"}
              type={"text"}
              id={"vipTables"}
              name={"vipTables"}
              value={values.vipTables}
              onChange={handleTablesChange}
              onBlur={handleBlur}
              error={errors?.vipTables}
              touched={touched?.vipTables}
              maxLength={3}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="xxl:w-[650px] w-[450px] mt-1 mb-4">
            <AuthButton
              text={"Submit"}
              // disabled={
              //   Object.keys(errors).length > 0 || createLoungeMutation.isPending
              // }
              loading={createLoungeMutation.isPending}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default FloorPlanSetup;
