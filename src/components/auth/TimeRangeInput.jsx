/* eslint-disable react/prop-types */

export default function TimeRangeInput({
  label,
  startName,
  endName,
  startValue,
  endValue,
  onChange,
  onBlur,
  error,
  touched,
  disabled,
  variant = "dark", // dark | light
}) {
  const isDark = variant === "dark";

  const inputStyles = isDark
    ? `
      text-white
      bg-white/10
      backdrop-blur-[28px]
      border border-white/20
      focus:ring-2 focus:ring-white/20
      [color-scheme:dark]
    `
    : `
      text-gray-800
      bg-white
      border border-gray-300
      focus:ring-2 focus:ring-blue-200
      focus:border-blue-500
      [color-scheme:light]
    `;

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

      {/* Time Inputs */}
      <div className="flex items-center gap-3">
        {/* Start Time */}
        <input
          type="time"
          name={startName}
          value={startValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-sm rounded-[15px]
            focus:outline-none transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            ${inputStyles}
          `}
        />

        {/* End Time */}
        <input
          type="time"
          name={endName}
          value={endValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-sm rounded-[15px]
            focus:outline-none transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            ${inputStyles}
          `}
        />
      </div>

      {/* Error */}
      {error && touched && (
        <p className="text-red-500 text-[12px] mt-1">{error}</p>
      )}
    </div>
  );
}