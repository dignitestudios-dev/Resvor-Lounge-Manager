/* eslint-disable react/prop-types */
import { useState } from "react";
import { IoMdClose } from "react-icons/io";

export default function LoungeTags({
  label,
  value = [],
  onChange,
  placeholder = "Type and press Enter to add tags",
  className,
  error,
  touched,
  maxTags,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Trim the input value to remove leading and trailing spaces
      const trimmedValue = inputValue.trim();

      // Validate: don't add empty strings or duplicates
      if (trimmedValue && !value.includes(trimmedValue)) {
        // Check max tags limit
        if (maxTags && value.length >= maxTags) {
          return;
        }

        onChange([...value, trimmedValue]);
        setInputValue("");
      }
    }
  };

  const handleRemoveTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div>
      <label className="block text-[14px] font-[500] text-white mb-2">
        {label}
      </label>

      {/* Input Field */}
      <div className="relative mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleAddTag}
          placeholder={placeholder}
          className={`w-full px-4 py-2 text-white text-sm rounded-[15px] bg-white/10 backdrop-blur-[28.9px] ring-1 ring-[#CACACA]
  focus:ring-2 focus:ring-gray-200 focus:outline-none placeholder:font-light placeholder:text-[12px] placeholder:text-[#E6E6F0] ${
    className || ""
  }`}
        />
      </div>
      {/* Tags Display */}
      {value.length > 0 && (
        <div className=" flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-[28.9px] px-3 py-1 rounded-full ring-1 ring-[#CACACA]"
            >
              <span className="text-white text-sm">{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="text-white hover:text-red-400 transition-colors flex items-center justify-center"
              >
                <IoMdClose size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && touched && (
        <p className="text-red-600 text-[12px] mt-1">{error}</p>
      )}

      {/* Max Tags Info */}
      {maxTags && (
        <p className="text-[#A0A0A0] text-[12px] mt-1">
          {value.length}/{maxTags} tags
        </p>
      )}
    </div>
  );
}
