/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";

const MIN_TAG_LENGTH = 2;
const MAX_TAG_LENGTH = 25;
const DEFAULT_MAX_TAGS = 10;

export default function LoungeTags({
  label,
  value = [],
  onChange,
  placeholder = "Type and press Enter to add tags",
  className = "",
  error,
  touched,
  maxTags = DEFAULT_MAX_TAGS,
  variant = "dark", // dark | light
}) {
  const [inputValue, setInputValue] = useState("");
  const [warning, setWarning] = useState("");

  const isDark = variant === "dark";

  // Auto-clear warning after 2 seconds
  useEffect(() => {
    if (!warning) return;
    const timer = setTimeout(() => setWarning(""), 2000);
    return () => clearTimeout(timer);
  }, [warning]);

  const handleAddTag = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const trimmedValue = inputValue.trim();

      if (!trimmedValue) return;

      // Check min length
      if (trimmedValue.length < MIN_TAG_LENGTH) {
        setWarning(`Tag must be at least ${MIN_TAG_LENGTH} characters`);
        return;
      }

      // Check max length (also enforced via maxLength on input, but just in case)
      if (trimmedValue.length > MAX_TAG_LENGTH) {
        setWarning(`Tag must not exceed ${MAX_TAG_LENGTH} characters`);
        return;
      }

      // Check duplicate
      if (value.includes(trimmedValue)) {
        setWarning("This tag already exists");
        return;
      }

      // Check max tags
      if (value.length >= maxTags) {
        setWarning(`Maximum of ${maxTags} tags allowed`);
        return;
      }

      setWarning("");
      onChange([...value, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const isAtLimit = value.length >= maxTags;

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

      {/* Input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleAddTag}
          placeholder={isAtLimit ? `Maximum of ${maxTags} tags reached` : placeholder}
          maxLength={MAX_TAG_LENGTH}
          disabled={isAtLimit}
          className={`
            w-full px-4 py-3 text-sm rounded-[15px]
            focus:outline-none transition-all duration-200
            placeholder:text-[12px] placeholder:font-light
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}

            ${
              isDark
                ? `
                  text-white
                  bg-white/10
                  backdrop-blur-[28px]
                  border border-white/20
                  placeholder:text-gray-300
                  focus:ring-2 focus:ring-white/20
                `
                : `
                  text-gray-800
                  bg-white
                  border border-gray-300
                  placeholder:text-gray-400
                  focus:ring-2 focus:ring-blue-200
                  focus:border-blue-500
                `
            }
          `}
        />
      </div>

      {/* Inline warning */}
      {warning && (
        <p className="text-amber-400 text-[12px] mb-2">{warning}</p>
      )}

      {/* Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 px-3 py-1 rounded-full
                transition-all duration-200 max-w-[200px]
                ${
                  isDark
                    ? `
                      bg-white/20
                      backdrop-blur-[28px]
                      border border-white/20
                    `
                    : `
                      bg-gray-100
                      border border-gray-300
                    `
                }
              `}
            >
              <span
                className={`text-sm truncate ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
                title={tag}
              >
                {tag}
              </span>

              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className={`
                  transition-colors flex items-center justify-center flex-shrink-0
                  ${
                    isDark
                      ? "text-white hover:text-red-400"
                      : "text-gray-600 hover:text-red-500"
                  }
                `}
              >
                <IoMdClose size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && touched && (
        <p className="text-red-500 text-[12px] mt-1">{error}</p>
      )}

      {/* Tags Count */}
      <p
        className={`text-[12px] mt-1 ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {value.length}/{maxTags} tags
        {` (${MIN_TAG_LENGTH}-${MAX_TAG_LENGTH} chars each)`}
      </p>
    </div>
  );
}