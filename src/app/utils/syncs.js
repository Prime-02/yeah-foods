import { toast } from "react-toastify";

/**
 * Validates that all required fields in a form object are filled.
 * Displays warning toasts for empty fields.
 *
 * @param {Object} form - The form object to validate
 * @param {Array<string>} [allowedEmptyKeys=[]] - Array of keys that are allowed to be empty
 * @returns {boolean} True if all required fields are valid, false otherwise
 */
export const validateFields = (form, allowedEmptyKeys = []) => {
  // Handle null/undefined form
  if (!form) {
    toast.error("Form object is null or undefined");
    return false;
  }

  // Convert form keys to array and validate each field
  return Object.keys(form).every((key) => {
    // Skip validation for allowed empty fields
    if (allowedEmptyKeys.includes(key)) {
      return true;
    }

    const value = form[key];

    // Check for empty strings, null, or undefined
    if (value === "" || value === null || value === undefined) {
      toast.warn(`Please fill in the ${key} field.`);
      return false;
    }

    // Optional: Check for empty arrays/objects if needed
    if (Array.isArray(value) && value.length === 0) {
      toast.warn(`Please provide at least one item for ${key}.`);
      return false;
    }

    return true;
  });
};
