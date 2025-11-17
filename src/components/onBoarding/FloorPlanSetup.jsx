/* eslint-disable react/prop-types */

import AuthButton from "../auth/AuthButton";
import { useFormik } from "formik";
import AuthInput from "../auth/AuthInput";
import { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

const FloorPlanSetup = ({ handleNext, handlePrevious }) => {
  const [floorPlan, setFloorPlan] = useState(null);

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    initialValues: {
      floorPlan: null,
      regularTables: "",
      vipTables: "",
    },
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, action) => {
      console.log("🚀 ~ FloorPlanSetup ~ values:", values);
      handleNext();
    },
  });

  const handleFloorPlanChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFloorPlan(file);
      setFieldValue("floorPlan", file);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-auto">
      <div className="flex justify-start items-center absolute top-12 left-0">
        <button type="button" onClick={() => handlePrevious()}>
          <FaArrowLeftLong color="white" size={24} />
        </button>
      </div>
      <div className="mt-4 xxl:w-[400px] xxl:ml-12 text-center space-y-4">
        <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
          Set Up Your <br />
          Lounge Floor Plan
        </p>
        <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]">
          Upload your lounge&apos;s floor plan to give guests a visual seating
          experience.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px] mt-10">
          {/* Floor Plan Upload */}
          <div className="border-2 border-dashed border-white/30 rounded-[20px] p-8 flex flex-col items-center justify-center min-h-[200px] relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFloorPlanChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-center text-white/70">
              <div className="text-2xl mb-2">+</div>
              <p className="underline">Upload Floor Plan</p>
            </div>
          </div>

          {/* Floor Plan Preview */}
          {values.floorPlan && (
            <div className="rounded-[20px] border-2 border-white/20 bg-white/5 backdrop-blur p-4">
              <p className="text-white font-[500] mb-3">Floor Plan Preview</p>
              <img
                src={typeof values.floorPlan === "string" ? values.floorPlan : URL.createObjectURL(values.floorPlan)}
                alt="floor plan preview"
                className="w-full h-[200px] object-cover rounded-lg"
              />
            </div>
          )}

          {/* Regular Tables */}
          <div className="mt-4">
            <AuthInput
              label={"Regular Tables"}
              text={"regularTables"}
              placeholder={"Enter number of tables"}
              type={"number"}
              id={"regularTables"}
              name={"regularTables"}
              value={values.regularTables}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors?.regularTables}
              touched={touched?.regularTables}
            />
          </div>

          {/* VIP Tables */}
          <div className="mt-4">
            <AuthInput
              label={"VIP Tables"}
              text={"vipTables"}
              placeholder={"Enter number of VIP tables"}
              type={"number"}
              id={"vipTables"}
              name={"vipTables"}
              value={values.vipTables}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors?.vipTables}
              touched={touched?.vipTables}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="xxl:w-[650px] w-[350px] mt-1 mb-4">
            <AuthButton text={"Next"} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default FloorPlanSetup;
