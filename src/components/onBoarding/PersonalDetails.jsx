/* eslint-disable react/prop-types */

import AuthButton from "../auth/AuthButton";
import { useFormik } from "formik";
import AuthInput from "../auth/AuthInput";
import PhoneInput from "../auth/PhoneInput";
import { useState } from "react";
import TagsInputField from "./TagsInputField";
import { FaArrowLeftLong } from "react-icons/fa6";

const PersonalDetails = ({ handleNext, handlePrevious }) => {
  const [userImage, setUserImage] = useState("");
  console.log("🚀 ~ PersonalDetails ~ userImage:", userImage);
  const [dateModalData, setDateModalData] = useState("");
  console.log("🚀 ~ PersonalDetails ~ dateModalData:", dateModalData);

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
      userImage: null,
      name: "",
      email: "",
      phone: "",
      operatingHours: "",
      specialization: "",
      location: "",
      images: [],
      description: "",
      role: "lounge_manager",
    },
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, action) => {
      console.log("🚀 ~ CreateAccount ~ action:", action);
      console.log("🚀 ~ CreateAccount ~ values:", values);
      handleNext();
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setFieldValue("userImage", file);
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFieldValue("images", files);
  };
  return (
    <div className="flex flex-col justify-center items-center h-auto ">
      <div className="flex justify-start items-center absolute top-12 left-0">
        <button type="button" onClick={() => handlePrevious()}>
          <FaArrowLeftLong color="white" size={24} />
        </button>
      </div>
      <div className="mt-4 xxl:w-[400px] xxl:ml-12 text-center space-y-4">
        <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
          Create Your <br />
          Lounge Account
        </p>
        <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6]">
          Please enter your details to create an account.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px] mt-10">
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
              {touched.userImage && errors.userImage && (
                <p className="text-red-600 text-xs mt-1">{errors.userImage}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className=" w-full">
              <AuthInput
                label={"Lounge Name"}
                text={"loungeName"}
                placeholder={"Enter your name"}
                type={"text"}
                id={"name"}
                name={"name"}
                maxLength={50}
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
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors?.phone}
                touched={touched?.phone}
              />
            </div>
            <div className=" w-full">
              <AuthInput
                label={"Operating Hours"}
                text={"operatingHours"}
                placeholder={"00:00 - 00:00"}
                type={"text"}
                id={"operatingHours"}
                name={"operatingHours"}
                maxLength={30}
                value={values.operatingHours}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors?.operatingHours}
                touched={touched?.operatingHours}
              />
            </div>
          </div>

          <div className="mt-4">
            <AuthInput
              label={"Highlight Specialization"}
              text={"specialization"}
              placeholder={"Enter your Specialization"}
              type={"text"}
              id={"specialization"}
              name={"specialization"}
              maxLength={60}
              value={values.specialization}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors?.specialization}
              touched={touched?.specialization}
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

          <div className="mt-4 grid grid-cols-2 gap-8 items-start">
            <div>
              <label className="text-[14px] font-[500] text-white block mb-2">
                Upload Images
              </label>
              <div className="w-[180px] h-[100px] rounded-[12px] border-2 border-dashed border-white/30 flex items-center justify-center relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center text-white/70">
                  choose file to upload
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
            </div>

            <div>
              <label className="text-[14px] font-[500] text-white block mb-2">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe your business"
                className="w-full h-[100px] rounded-[12px] border-2 border-white bg-white/10 placeholder:text-gray-400 text-[#E6E6F0] p-3"
              />
            </div>
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
          <div className="xxl:w-[650px] w-[350px] mt-1 mb-4">
            <AuthButton text={"Next"} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
