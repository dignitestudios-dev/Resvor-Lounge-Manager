/* eslint-disable react/prop-types */

const PhoneInput = ({
  value,
  onChange,
  onBlur,
  id,
  name,
  isDisabled = false,
  autoComplete,
  error,
  touched,
  label,
  variant = "dark", // dark | light
}) => {
  const isDark = variant === "dark";

  const handleKeyPress = (e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div>
      {/* Label */}
      <label
        htmlFor={id}
        className={`block text-[14px] font-[500] mb-2 ${
          isDark ? "text-white" : "text-gray-700"
        }`}
      >
        {label}
      </label>

      {/* Wrapper */}
      <div
        className={`
          flex items-center w-full px-3 py-2 rounded-[15px]
          transition-all duration-200
          ${
            isDark
              ? `
                bg-white/10
                backdrop-blur-[28px]
                border border-white/20
                text-white
                focus-within:ring-2 focus-within:ring-white/20
              `
              : `
                bg-white
                border border-gray-300
                text-gray-800
                focus-within:ring-2 focus-within:ring-blue-200
                focus-within:border-blue-500
              `
          }
        `}
      >
        {/* Flag */}
        <img
          src="https://flagcdn.com/w320/us.png"
          alt="US flag"
          className="w-6 h-4 mr-2 rounded-sm object-cover"
        />

        {/* Country Code */}
        <span
          className={`text-[13px] font-[500] w-[40px] text-center ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          +1
        </span>

        {/* Divider */}
        <div
          className={`border-l h-6 mx-2 ${
            isDark ? "border-white/20" : "border-gray-300"
          }`}
        />

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyPress={handleKeyPress}
          id={id}
          name={name}
          maxLength={14}
          disabled={isDisabled}
          autoComplete={autoComplete}
          placeholder="Enter Phone Number"
          className={`
            w-full bg-transparent text-sm py-1
            focus:outline-none
            placeholder:text-[12px] placeholder:font-light
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              isDark
                ? `
                  text-white
                  placeholder:text-gray-300
                `
                : `
                  text-gray-800
                  placeholder:text-gray-400
                `
            }
          `}
        />
      </div>

      {/* Error */}
      {error && touched && (
        <p className="text-red-500 text-[12px] mt-1">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
