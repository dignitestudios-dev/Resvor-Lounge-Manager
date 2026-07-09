/* eslint-disable react/prop-types */

import AuthButton from "../auth/AuthButton";
import { useFormik } from "formik";
import AuthInput from "../auth/AuthInput";
import PhoneInput from "../auth/PhoneInput";
import { useState } from "react";
import TagsInputField from "./TagsInputField";
import { FaArrowLeftLong } from "react-icons/fa6";
import { personalDetailsValues } from "@/lib/init/personalDetailsValues";
import { personalDetailsSchema } from "@/lib/schema/onboarding/personalDetailsSchema";
import { ErrorToast } from "../ui/toaster";
import {
  handleFormattedOperatingHoursChange,
  phoneFormatter,
  validateImageResolution,
} from "@/lib/utils";
import PersonalDetailsRemaining from "./PersonalDetailsRemaining";
import FloorPlanSetup from "./FloorPlanSetup";
import { LogOutIcon } from "lucide-react";
import TimeRangeInput from "../auth/TimeRangeInput";
import LoungeTags from "./LoungeTags";

const PersonalDetails = ({ handleNext, handlePrevious, setCurrentState }) => {
  const [userImage, setUserImage] = useState("");
  const [remainingDetails, setRemainingDetails] = useState(false);
  const [combinedData, setCombinedData] = useState({});
  const [imageError, setImageError] = useState("");

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    initialValues: personalDetailsValues,
    validationSchema: personalDetailsSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        // Pass data to next step
        setRemainingDetails("remainingDetails");
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

  const handleFileChange = async (e) => {
    const file = e.currentTarget.files?.[0];
    setImageError("");

    if (file) {
      // Check file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        const errorMsg = "Only JPEG and PNG formats are allowed";
        setImageError(errorMsg);
        ErrorToast(errorMsg);
        return;
      }

      // Check file size (10MB)
      if (file.size > 11 * 1024 * 1024) {
        const errorMsg = "File size must not exceed 10MB";
        setImageError(errorMsg);
        ErrorToast(errorMsg);
        return;
      }

      // Check image resolution (215x215)
      // const isValidResolution = await validateImageResolution(file);
      // if (!isValidResolution) {
      //   const errorMsg = "Image resolution must be at least 215x215";
      //   setImageError(errorMsg);
      //   ErrorToast(errorMsg);
      //   return;
      // }

      setUserImage(file);
      setFieldValue("userImage", file);
    }
  };

  const handleRemainingData = (data) => {
    setCombinedData(data);
    setRemainingDetails("floorPlan");
  };

  const formatTo12Hour = (time) => {
    const [hour, minute] = time?.split(":");

    const h = Number(hour);

    const ampm = h >= 12 ? "PM" : "AM";

    const formattedHour = h % 12 || 12;

    return `${formattedHour}:${minute} ${ampm}`;
  };

  const operatingHours = `${formatTo12Hour(
    values.openingTime,
  )} - ${formatTo12Hour(values.closingTime)}`;

  return (
    <>
      {remainingDetails === "remainingDetails" ? (
        <PersonalDetailsRemaining
          handleNext={handleRemainingData}
          handlePrevious={handlePrevious}
          previousData={{ ...values, operatingHours: operatingHours }}
        />
      ) : remainingDetails === "floorPlan" ? (
        <FloorPlanSetup
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          combinedData={combinedData}
          setCurrentState={setCurrentState}
        />
      ) : (
        <div className="flex flex-col justify-center items-center h-auto ">
          <div className="flex justify-end absolute top-10 w-[600px]">
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
          <div className="mt-4 xxl:w-[400px] lg:w-[500px] xxl:ml-12 text-center space-y-4">
            <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
              Create Your <br />
              Lounge Account
            </p>
            <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]">
              Please enter your details to create an account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[600px] md:w-[550px] w-[320px] mt-10">
              <div className="flex items-center xl:w-[500px] lg:w-[400px] md:w-[500px] w-[320px]">
                <div className="md:w-[80px] w-[60px] md:h-[80px] h-[60px] rounded-full  overflow-hidden">
                  <img
                    className="object-cover md:w-[80px] w-[60px] md:h-[80px] h-[60px] "
                    src={
                      values.userImage
                        ? typeof values.userImage === "string"
                          ? values.userImage
                          : URL.createObjectURL(values.userImage)
                        : "/images/uploadIcon.png"
                    }
                    alt="business logo"
                  />
                </div>
                <div className="pl-2 ">
                  <p className="text-[#BEC2C9]">
                    <span className="relative text-white capitalize underline pl-4">
                      Business Logo
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e)}
                        className="absolute inset-0 opacity-0 cursor-pointer -left-24"
                      />
                    </span>
                  </p>
                  {imageError && (
                    <p className="text-red-600 text-xs mt-1">{imageError}</p>
                  )}
                  {touched.userImage && errors.userImage && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.userImage}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className=" w-full">
                  <AuthInput
                    label={"Lounge Name"}
                    text={"loungeName"}
                    placeholder={"Enter your lounge name"}
                    type={"text"}
                    id={"name"}
                    name={"name"}
                    maxLength={100}
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors?.name}
                    touched={touched?.name}
                  />
                </div>
                <div className=" w-full">
                  <AuthInput
                    label={"Business Email"}
                    text={"email"}
                    placeholder={"Enter your email address"}
                    type={"email"}
                    id={"email"}
                    name={"email"}
                    maxLength={60}
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors?.email}
                    touched={touched?.email}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className=" w-full">
                  <PhoneInput
                    label={"Business Phone Number"}
                    id={"phone"}
                    name={"phone"}
                    value={phoneFormatter(values.phone)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors?.phone}
                    touched={touched?.phone}
                  />
                </div>
                <div className=" w-full">
                  {/* <AuthInput
                    label={"Operating Hours"}
                    text={"operatingHours"}
                    placeholder={"00:00 - 00:00"}
                    type={"text"}
                    id={"operatingHours"}
                    name={"operatingHours"}
                    maxLength={30}
                    value={values.operatingHours}
                    onChange={handleFormattedOperatingHoursChange}
                    onBlur={handleBlur}
                    error={errors?.operatingHours}
                    touched={touched?.operatingHours}
                  /> */}
                  <TimeRangeInput
                    label="Operating Hours"
                    startName="openingTime"
                    endName="closingTime"
                    startValue={values.openingTime}
                    endValue={values.closingTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.openingTime || errors.closingTime}
                    touched={touched.openingTime || touched.closingTime}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="w-full">
                  <AuthInput
                    label={"Highlight Offers"}
                    text={"offers"}
                    placeholder={"Enter your Offers"}
                    type={"text"}
                    id={"offers"}
                    name={"offers"}
                    maxLength={250}
                    value={values.offers}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors?.offers}
                    touched={touched?.offers}
                  />
                </div>
              </div>

              <div className="mt-4">
                <LoungeTags
                  label="Lounge Tags"
                  value={values.loungeTags}
                  onChange={(tags) => setFieldValue("loungeTags", tags)}
                  placeholder="Type tag and press Enter..."
                  error={errors?.loungeTags}
                  touched={touched?.loungeTags}
                />
              </div>

              <div className="mt-4">
                <AuthInput
                  label={"Business Location"}
                  text={"location"}
                  placeholder={"Enter your Location"}
                  type={"text"}
                  id={"location"}
                  name={"location"}
                  maxLength={100}
                  value={values.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors?.location}
                  touched={touched?.location}
                />
              </div>
              <div>
                <img
                  src={"/images/mapImg.png"}
                  alt="map"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div className="mt-4">
                <label className="text-[14px] font-[500] text-white block mb-2">
                  Select Your Role
                </label>
                <div className="flex gap-6 items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="lounge_manager"
                      checked={values.role === "lounge_manager"}
                      onChange={(e) => setFieldValue("role", e.target.value)}
                    />
                    <span className="text-[#E6E6F0]">Lounge Manager</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="promoter"
                      checked={values.role === "promoter"}
                      onChange={(e) => setFieldValue("role", e.target.value)}
                    />
                    <span className="text-[#E6E6F0]">Promoter</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 ">
              <div className="xxl:w-[650px] w-[600px] mt-1 mb-4">
                <AuthButton text={"Next"} />
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default PersonalDetails;
