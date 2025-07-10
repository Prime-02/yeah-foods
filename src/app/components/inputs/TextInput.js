import React from "react";
import PropTypes from "prop-types";

const TextInput = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  error = false,
  className = "",
  id,
  name,
  label,
  helperText,
  ...props
}) => {
  const inputClasses = `
  w-full px-4 py-2 rounded-md border-2
  focus:outline-none focus:ring-2 
  transition duration-200
  ${
    error
      ? "border-red-500 focus:ring-red-200"
      : "border-gray-300 focus:ring-green-200 focus:border-green-500"
  }
  ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
  ${className || ""}
`;

  const handleChange = (e) => {
    const value = e.target.value;
    onChange(value);
  };
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium ${
            error ? "text-red-600" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={inputClasses}
        id={id}
        name={name}
        {...props}
      />
      {helperText && (
        <p className={`text-xs ${error ? "text-red-600" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

TextInput.propTypes = {
  type: PropTypes.oneOf(["text", "password", "email", "number", "tel", "url"]),
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.string,
};

export default TextInput;
