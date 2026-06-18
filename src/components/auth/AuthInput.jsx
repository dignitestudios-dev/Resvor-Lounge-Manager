/* eslint-disable react/prop-types */
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  showToggle = false,
  className = "",
  onBlur,
  error,
  touched,
  name,
  maxLength,
  disabled,
  required = false,
  variant = "dark", // dark | light
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isDark = variant === "dark";

  return (
    <div>
      {/* Label */}
      <label
        className={`block text-[14px] font-[500] mb-2 ${
          isDark ? "text-white" : "text-gray-700"
        }`}
      >
        {label}
      </label>

      {/* Input Wrapper */}
      <div className="relative">
        <input
          disabled={disabled}
          type={showToggle ? (showPassword ? "text" : "password") : type}
          value={value}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          onBlur={onBlur}
          maxLength={maxLength}
          required={required}
          className={`
            w-full px-4 py-3 text-sm rounded-[15px]
            focus:outline-none transition-all duration-200
            placeholder:text-[12px] placeholder:font-light
            disabled:opacity-50 disabled:cursor-not-allowed
            ${showToggle ? "pr-12" : ""}
            
            ${
              isDark
                ? `
                  text-white
                  bg-white/10
                  backdrop-blur-[28px]
                  border border-white/20
                  placeholder:text-gray-300
                  focus:border-white/40
                  focus:ring-2 focus:ring-white/20
                `
                : `
                  text-gray-800
                  bg-white
                  border border-gray-300
                  placeholder:text-gray-400
                  focus:border-blue-500
                  focus:ring-2 focus:ring-blue-200
                `
            }

            ${className}
          `}
        />

        {/* Password Toggle */}
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
              isDark
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        )}
      </div>

      {/* Error */}
      {error && touched && (
        <p className="text-red-500 text-[12px] mt-1">{error}</p>
      )}
    </div>
  );
}
