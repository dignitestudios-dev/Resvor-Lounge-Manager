/* eslint-disable react/prop-types */
// src/components/Input.jsx
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  showToggle = false,
  className,
  onBlur,
  error,
  touched,
  name,
  maxLength,
  min,
  disabled,
  required = false,
  prefix,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-[14px] font-[500] text-[#181818] mb-2">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-[#181818] font-medium pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          disabled={disabled}
          type={showToggle ? (showPassword ? "text" : "password") : type}
          value={value}
          name={name}
          min={min}
          onChange={(e) => {
            if (maxLength && e.target.value.length > maxLength) {
              e.target.value = e.target.value.slice(0, maxLength);
            }
            if (onChange) onChange(e);
          }}
          placeholder={placeholder}
          onBlur={onBlur}
          maxLength={maxLength}
          required={required}
          className={`w-full px-4 py-2 text-sm text-[#181818] rounded-[15px] bg-transparent ring-1 ring-[#CACACA] 
            focus:ring-2 focus:ring-gray-200 focus:outline-none pr-4 placeholder:font-light placeholder:text-[12px] placeholder:text-[#727272] ${
              prefix ? "pl-7" : ""
            } ${className || ""}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-5 top-2.5 text-gray-200 hover:text-gray-400"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        )}
      </div>
      {error && touched && <p className="text-red-600 text-[12px]">{error}</p>}
    </div>
  );
}
