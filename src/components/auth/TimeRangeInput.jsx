// src/components/TimeRangeInput.jsx

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
}) {
  return (
    <div>
      <label className="block text-[14px] font-[500] text-white mb-2">
        {label}
      </label>

      <div className="flex items-center gap-3">
        {/* Start Time */}
        <input
          type="time"
          name={startName}
          value={startValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="
            w-full px-4 py-2 text-white text-sm rounded-[15px]
            bg-white/10 backdrop-blur-[28.9px]
            ring-1 ring-[#CACACA]
            focus:ring-2 focus:ring-gray-200
            focus:outline-none
            appearance-none
            [color-scheme:dark]
          "
        />

        {/* <span className="text-white text-sm shrink-0">to</span> */}

        {/* End Time */}
        <input
          type="time"
          name={endName}
          value={endValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="
            w-full px-4 py-2 text-white text-sm rounded-[15px]
            bg-white/10 backdrop-blur-[28.9px]
            ring-1 ring-[#CACACA]
            focus:ring-2 focus:ring-gray-200
            focus:outline-none
            appearance-none
            [color-scheme:dark]
          "
        />
      </div>

      {error && touched && (
        <p className="text-red-600 text-[12px] mt-1">{error}</p>
      )}
    </div>
  );
}
