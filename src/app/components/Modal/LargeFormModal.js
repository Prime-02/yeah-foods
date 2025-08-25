import { ArrowLeft, ArrowRight, X } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import Button from "../reusables/buttons/Buttons";
import { BASE_URL, largeFormOptions } from "../index";
import { useGlobalState } from "@/app/GlobalStateProvider";
import { PostAllData } from "../../../functions/Posts";
import { toast } from "react-toastify";
import {
  removeEmptyStringValues,
} from "../../../functions/utils";
import { GetAllData } from "../../../functions/Get";
import TextInput from "../inputs/TextInput";

const LargeFormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  disabled,
  clickedTitle,
  buttonValue,
  subChildren,
  formType = "firm",
  initialValues = {},
}) => {
  if (!isOpen) return null;

  // State management
  const [formStep, setFormStep] = useState(1);
  const { access, loading, setLoading } = useGlobalState();
  const [id, setId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Initialize form with default values
  const getInitialForm = useCallback(() => {
    return {
      matter: {
        email: {
          label: "Primary Contact Email",
          value: initialValues.email || "",
          type: "email",
          desc: `${
            formType === "matter" ? "This field is required" : "Optional"
          }`,
          required: true,
        },
        name: {
          label: "File Name",
          value: initialValues.name || "",
          type: "text",
          desc: "This field is required",
          required: true,
        },
        file_number: {
          label: "File Number",
          value: initialValues.file_number || "",
          type: "text",
          desc: `${
            formType === "matter" ? "This field is required" : "Optional"
          }`,
          required: formType === "lead" ? false : true,
        },
        subject_matter: {
          label: "Subject Matter",
          value: initialValues.subject_matter || "",
          type: "text",
          desc: `${
            formType === "matter" ? "This field is required" : "Optional"
          }`,
          required: formType === "lead" ? false : true,
        },
        case_type: {
          label: "Area Of Law",
          value: initialValues.case_type || "",
          type: "text",
          required: false,
        },
        source_of_retainer: {
          label: "Source of Retainer",
          value: initialValues.source_of_retainer || "",
          type: "text",
          required: false,
        },
        bill_method: {
          label: "Bill Method",
          value: initialValues.bill_method || "",
          options: largeFormOptions.billMethod,
          type: "dropdown",
          desc: (
            <span className="">
              <strong>Note:</strong> This is only optional if the contract is
              not yet signed
            </span>
          ),
          required: false,
          conditionalRequirement: (form) =>
            form.matter.contract_signed.value === "S",
        },
        contract_signed: {
          label: "Contract Signed",
          value: initialValues.contract_signed || "",
          options: largeFormOptions.contractSigned,
          type: "dropdown",
          desc: `${
            formType === "matter" ? "This field is required" : "Optional"
          }`,
          required: formType === "lead" ? false : true,
        },
      },
      clientDetails: [
        {
          name: {
            label: "Name",
            value: "",
            type: "text",
            desc: "This field is required",
            required: false,
          },
          date_of_birth: {
            label: "Date of Birth",
            value: "",
            type: "date",
            desc: "Optional",
            required: false,
          },
          email: {
            label: "Email",
            value: "",
            type: "email",
            desc: "Optional",
            required: false,
          },
          phone_number: {
            label: "Phone Number",
            value: "",
            type: "phone",
            desc: "Optional",
            required: false,
          },
          address: {
            label: "Address",
            value: "",
            type: "text",
            desc: "Optional",
            required: false,
          },
          // state: {
          //   label: "Province/Teritory",
          //   value: "",
          //   type: "text",
          //   desc: "Optional",
          //   required: false,
          // },
          // city: {
          //   label: "City",
          //   value: "",
          //   type: "text",
          //   desc: "Optional",
          //   required: false,
          // },
          postal_code: {
            label: "Postal Code",
            value: "",
            type: "text",
            desc: "Optional",
            required: false,
          },
        },
      ],
      otherPartiesDetails: [
        {
          name: {
            label: "Name",
            value: "",
            type: "text",
            desc: "Optional",
            required: false,
          },
          role: {
            label: "Role",
            value: "",
            type: "text",
            desc: "Optional",
            required: false,
          },
          email: {
            label: "Email",
            value: "",
            type: "text",
            desc: "Optional",
            required: false,
          },
          address: {
            label: "Address",
            value: "",
            type: "text",
            desc: "Optional",
            required: false,
          },
          phone_number: {
            label: "Phone Number",
            value: "",
            type: "phone",
            desc: "Optional",
            required: false,
          },
        },
      ],
    };
  }, [initialValues]);

  const [form, setForm] = useState(getInitialForm());

  const setMatterFieldsRequired = (fieldNames) => {
    setForm((prevForm) => {
      const newMatter = { ...prevForm.matter };

      fieldNames.forEach((fieldName) => {
        if (newMatter[fieldName]) {
          newMatter[fieldName] = {
            ...newMatter[fieldName],
            required: true,
          };
        }
      });

      return {
        ...prevForm,
        matter: newMatter,
      };
    });
  };

  // Progress indicator for multi-step form
  const FormProgress = () => {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-y-2 justify-between items-center">
          {["Matter Details", "Client Details", "Other Parties"].map(
            (step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep > index + 1
                      ? "bg-green-500 text-white"
                      : formStep === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {formStep > index + 1 ? "✓" : index + 1}
                </div>
                <span
                  className={`ml-2 ${
                    formStep === index + 1 ? "font-medium" : ""
                  }`}
                >
                  {step}
                </span>
                {index < 2 && (
                  <div
                    className={`h-0.5 w-5 md:w-16 mx-2 ${
                      formStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // Dynamic form field management based on conditions
  useEffect(() => {
    // Handle bill method field
    const { bill_method } = form.matter;
    if (!bill_method) return;

    setForm((prevForm) => {
      const updatedMatter = { ...prevForm.matter };

      // Manage contingency percentage vs fees fields
      if (bill_method.value === "C") {
        delete updatedMatter.fees;
        updatedMatter.contingency_percentage = {
          label: "Contingency Percentage",
          value: "",
          type: "number",
          desc: "This field is required (1-100)",
          required: false,
          min: 1,
          max: 100,
        };
      } else {
        delete updatedMatter.contingency_percentage;
        updatedMatter.fees = {
          label: "Fee",
          value: "",
          type: "number",
          desc: "Optional",
          required: false,
          min: 0,
        };
      }

      return {
        ...prevForm,
        matter: updatedMatter,
      };
    });
  }, [form.matter.bill_method.value]);

  // Handle contract signed date field
  useEffect(() => {
    const { contract_signed } = form.matter;

    setForm((prevForm) => {
      const updatedMatter = { ...prevForm.matter };

      if (contract_signed.value === "S") {
        updatedMatter.date_signed = {
          label: "Date Signed",
          value: "",
          type: "date",
          desc: "Optional",
          required: false,
        };
      } else {
        delete updatedMatter.date_signed;
      }

      return {
        ...prevForm,
        matter: updatedMatter,
      };
    });
  }, [form.matter.contract_signed.value]);

  // Handle form input changes
  const handleChange = (section, index, key, value = "" ) => {
    setForm((prevForm) => {
      const updatedForm = { ...prevForm };

      // Clear error for this field
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        if (section === "matter") {
          delete newErrors[`${section}.${key}`];
        } else {
          delete newErrors[`${section}.${index}.${key}`];
        }
        return newErrors;
      });

      if (section === "matter") {
        // Special handling for phone numbers
        if (
          updatedForm[section][key].type === "phone" &&
          value &&
          !value?.startsWith("+")
        ) {
          updatedForm[section][key].value = `+${value}`;
        } else {
          updatedForm[section][key].value = value;
        }
      } else {
        // Handle array fields (clientDetails, otherPartiesDetails)
        if (
          updatedForm[section][index][key].type === "phone" &&
          value &&
          !value?.startsWith("+")
        ) {
          updatedForm[section][index][key].value = `+${value}`;
        } else {
          updatedForm[section][index][key].value = value;
        }
      }

      return updatedForm;
    });
  };

  // Add more entries to repeatable sections
  const handleAddMore = (section) => {
    const defaultFields = {
      clientDetails: {
        name: {
          label: "Name",
          value: "",
          type: "text",
          desc: "This field is required",
          required: false,
        },
        date_of_birth: {
          label: "Date of Birth",
          value: "",
          type: "date",
          desc: "Optional",
          required: false,
        },
        email: {
          label: "Email",
          value: "",
          type: "email",
          desc: "Optional",
          required: false,
        },
        phone_number: {
          label: "Phone Number",
          value: "",
          type: "phone",
          desc: "Optional",
          required: false,
        },
        address: {
          label: "Address",
          value: "",
          type: "text",
          desc: "Optional",
          required: false,
        },
        postal_code: {
          label: "Postal Code",
          value: "",
          type: "text",
          desc: "Optional",
          required: false,
        },
      },
      otherPartiesDetails: {
        name: {
          label: "Name",
          value: "",
          type: "text",
          desc: "This field is required",
          required: false,
        },
        role: {
          label: "Role",
          value: "",
          type: "text",
          desc: "Optional",
          required: false,
        },
        email: {
          label: "Email",
          value: "",
          type: "text",
          desc: "Optional",
          required: false,
        },
        address: {
          label: "Address",
          value: "",
          type: "text",
          desc: "Optional",
          required: false,
        },
        phone_number: {
          label: "Phone Number",
          value: "",
          type: "phone",
          desc: "Optional",
          required: false,
        },
      },
    };

    setForm((prevForm) => ({
      ...prevForm,
      [section]: [...prevForm[section], defaultFields[section]],
    }));
  };

  const [namesToCheck, setNamesToCheck] = useState({
    clientDetails: [],
    otherPartiesDetails: [],
  });

  const checkNames = async (type = "client") => {
    const field =
      type === "client" ? getClientDetails() : getOtherPartiesDetails();

    setNamesToCheck({
      ...namesToCheck,
      [type === "client" ? "clientDetails" : "otherPartiesDetails"]: field,
    });

    if (field.length === 0) {
      toast.warn(
        `Please add a ${type === "client" ? "Client" : "Party"} name to check`
      );
      return;
    }

    if (type === "client") {
      setLoading("checking_client_name");
    } else {
      setLoading("checking_other_pary_name");
    }

    console.log(field[field.length - 1].name);
    try {
      const response = await GetAllData(
        access,
        `${BASE_URL}/check-name-conflicts/`,
        "Name Check",
        {
          name: field[field.length - 1].name,
          file_id: id,
          check_type: type,
        }
      );
      if (response.warning && response.warning.length !== null) {
        toast.warn(`${response.warning}`);
      }
    } catch (error) {
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveLast = (section) => {
    setForm((prevForm) => {
      if (prevForm[section]?.length > 1) {
        return {
          ...prevForm,
          [section]: prevForm[section].slice(0, -1),
        };
      }
      return prevForm;
    });
  };

  // Improved validation with detailed error tracking
  const validateFields = (section, index = null) => {
    const fields = index !== null ? form[section][index] : form[section];
    let isValid = true;
    const newErrors = { ...formErrors };

    for (const key in fields) {
      const field = fields[key];

      // Skip validation if field is not required
      if (!field.required) {
        // Check conditional requirement if specified
        if (
          field.conditionalRequirement &&
          field.conditionalRequirement(form)
        ) {
          // Now it's conditionally required
        } else {
          continue;
        }
      }

      // Check if field is empty
      if (field.value === "") {
        isValid = false;
        const errorKey =
          index !== null ? `${section}.${index}.${key}` : `${section}.${key}`;
        newErrors[errorKey] = `${field.label} is required`;

        // Show toast for the first error only to avoid flooding
        if (Object.keys(newErrors).length === 1) {
          toast.warn(`Please fill in the ${field.label} field.`);
        }
      }
      // Validate number fields
      else if (field.type === "number") {
        const numValue = parseFloat(field.value);

        if (field.min !== undefined && numValue < field.min) {
          isValid = false;
          const errorKey =
            index !== null ? `${section}.${index}.${key}` : `${section}.${key}`;
          newErrors[errorKey] = `${field.label} must be at least ${field.min}`;
          toast.warn(`${field.label} must be at least ${field.min}`);
        }

        if (field.max !== undefined && numValue > field.max) {
          isValid = false;
          const errorKey =
            index !== null ? `${section}.${index}.${key}` : `${section}.${key}`;
          newErrors[
            errorKey
          ] = `${field.label} must be no more than ${field.max}`;
          toast.warn(`${field.label} must be no more than ${field.max}`);
        }
      }
      // Validate email fields
      else if (field.type === "email" && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
          isValid = false;
          const errorKey =
            index !== null ? `${section}.${index}.${key}` : `${section}.${key}`;
          newErrors[errorKey] = `Please enter a valid email address`;
          toast.warn(`Please enter a valid email address for ${field.label}`);
        }
      }
      // Validate phone fields
      else if (field.type === "phone" && field.value) {
        // Basic phone validation - can be enhanced
        if (!/^\+[0-9]{8,15}$/.test(field.value)) {
          isValid = false;
          const errorKey =
            index !== null ? `${section}.${index}.${key}` : `${section}.${key}`;
          newErrors[errorKey] = `Please enter a valid phone number`;
          toast.warn(`Please enter a valid phone number for ${field.label}`);
        }
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Check for duplicate entries
  const checkForDuplicates = (section) => {
    const details = form[section];

    if (!Array.isArray(details)) {
      console.error(`Invalid ${section}: Expected an array.`);
      return false;
    }

    // Different duplicate checking based on section
    if (section === "clientDetails") {
      const emailSet = new Set();

      for (let i = 0; i < details.length; i++) {
        const detail = details[i];
        if (!detail.email || !detail.email.value) continue;

        const emailValue = detail.email.value.toLowerCase().trim();
        if (emailSet.has(emailValue)) {
          toast.warn(`Duplicate email found in ${section}: ${emailValue}`);

          // Mark the duplicate field as having an error
          setFormErrors((prev) => ({
            ...prev,
            [`${section}.${i}.email`]: "Duplicate email address",
          }));

          return false;
        }
        emailSet.add(emailValue);
      }
    } else if (section === "otherPartiesDetails") {
      const nameRoleSet = new Set();

      for (let i = 0; i < details.length; i++) {
        const detail = details[i];
        if (
          !detail.name ||
          !detail.name.value ||
          !detail.role ||
          !detail.role.value
        )
          continue;

        const key = `${detail.name.value
          .toLowerCase()
          .trim()}-${detail.role.value.toLowerCase().trim()}`;
        if (nameRoleSet.has(key)) {
          toast.warn(`Duplicate name and role combination found in ${section}`);

          // Mark the duplicate fields
          setFormErrors((prev) => ({
            ...prev,
            [`${section}.${i}.name`]: "Duplicate entry",
            [`${section}.${i}.role`]: "Duplicate entry",
          }));

          return false;
        }
        nameRoleSet.add(key);
      }
    }

    return true;
  };

  // Submit matter details
  const submitMatterDetails = async () => {
    // Special validation for contract signed
    if (form.matter.contract_signed.value === "N") {
      // When contract is not signed, bill_method is optional
      const requiredFieldsForValidation = Object.keys(form.matter).filter(
        (key) => {
          if (key === "bill_method" || key === "date_signed") return false;
          return form.matter[key].required;
        }
      );

      if (!validateFieldsByKeys("matter", null, requiredFieldsForValidation)) {
        return;
      }
    } else {
      // When contract is signed, validate all required fields
      if (!validateFields("matter", null)) return;
    }
    if (
      form.matter?.contingency_percentage &&
      (form.matter.contingency_percentage.value > 100 ||
        form.matter.contingency_percentage.value < 1)
    ) {
      toast.warn("Contingency percentage must be at least 1 or at most 100");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading("posting_matter_details");

      // Prepare data for API
      const matterDetails = {};
      Object.entries(form.matter).forEach(([key, field]) => {
        if (field && field.value !== undefined) {
          matterDetails[key] = field.value;
        }
      });

      // Make API call based on form type
      let response;
      if (formType === "firm") {
        response = await PostAllData(
          access,
          removeEmptyStringValues(matterDetails),
          `${BASE_URL}/firm-lead/`,
          false,
          "Lead created successfully"
        );
      } else if (formType === "matter") {
        response = await PostAllData(
          access,
          removeEmptyStringValues(matterDetails),
          `${BASE_URL}/file/`,
          false,
          "Matter created successfully"
        );
      }

      // Handle response and move to next step
      if (response?.id && Number.isInteger(response.id)) {
        setId(response.id);
        console.log(response?.id);

        await onSubmit();
        setFormStep(2);
      } else {
        console.warn("Invalid or missing ID in response:", response);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      console.error("Submit Matter Details Error:", error);

      // Handle validation errors from API
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newFormErrors = { ...formErrors };

        // Map API error fields to form fields
        Object.entries(apiErrors).forEach(([field, message]) => {
          newFormErrors[`matter.${field}`] = message;
        });

        setFormErrors(newFormErrors);
      }

      toast.error(
        `Failed to create ${
          formType === "firm" ? "Lead" : "File Matter"
        }: ${errorMessage}`
      );
    } finally {
      setLoading(null);
      setIsSubmitting(false);
    }
  };

  // Helper function to validate only specific fields
  const validateFieldsByKeys = (section, index = null, keysToValidate) => {
    const fields = index !== null ? form[section][index] : form[section];
    let isValid = true;
    const newErrors = { ...formErrors };

    for (const key of keysToValidate) {
      const field = fields[key];
      if (!field) continue;

      if (field.value === "") {
        isValid = false;
        const errorKey =
          index !== null ? `${section}.${index}.${key}` : `${section}.${key}`;
        newErrors[errorKey] = `${field.label} is required`;

        if (Object.keys(newErrors).length === 1) {
          toast.warn(`Please fill in the ${field.label} field.`);
        }
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const getClientDetails = () => {
    // Get latest client details
    const clientsDataArray = form.clientDetails.map((client) => {
      const simplifiedClients = {};
      Object.entries(client).forEach(([key, field]) => {
        simplifiedClients[key] = field.value;
      });
      return simplifiedClients;
    });
    return clientsDataArray;
  };

  // Submit client details
  const submitClientDetails = async (addingMore = false) => {
    checkNames("client");

    // Validate the current client details entry
    if (!validateFields("clientDetails", form.clientDetails.length - 1)) {
      return;
    }

    // Check for duplicates
    if (!checkForDuplicates("clientDetails")) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading("posting_matter_client");

      // Post to appropriate endpoint
      let response;
      const endpoint =
        formType === "firm"
          ? `${BASE_URL}/firm-lead/${id}/lead-clients/`
          : `${BASE_URL}/file/${id}/clients/`;

      response = await PostAllData(
        access,
        getClientDetails(),
        endpoint,
        false,
        formType === "firm"
          ? "Client's Details added to lead"
          : "File Client Added"
      );

      // Handle success
      if (addingMore) {
        // Stay on the same step if adding more clients
        handleAddMore("clientDetails");
        // toast.success("Client added successfully.");
      } else {
        // Move to next step if finished adding clients
        await onSubmit();
        setFormStep(3);
      }
    } catch (error) {
      console.error("Submit Client Details Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";

      if (error.response?.status === 400) {
        toast.warn("Duplicate client details already exist.");
      } else {
        toast.error(`Failed to add client: ${errorMessage}`);
      }

      // Handle API validation errors
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newFormErrors = { ...formErrors };
        const index = form.clientDetails.length - 1;

        Object.entries(apiErrors).forEach(([field, message]) => {
          newFormErrors[`clientDetails.${index}.${field}`] = message;
        });

        setFormErrors(newFormErrors);
      }
    } finally {
      setLoading(null);
      setIsSubmitting(false);
    }
  };

  const getOtherPartiesDetails = () => {
    const otherPartiesDataArray = form.otherPartiesDetails.map((party) => {
      const simplifiedParty = {};
      Object.entries(party).forEach(([key, field]) => {
        simplifiedParty[key] = field.value;
      });
      return simplifiedParty;
    });
    return otherPartiesDataArray;
  };

  // Submit other parties details
  const submitOtherPartiesDetails = async (addingMore = false) => {
    checkNames("other_person");
    // Validate current other party entry
    if (
      !validateFields(
        "otherPartiesDetails",
        form.otherPartiesDetails.length - 1
      )
    ) {
      return;
    }

    // Check for duplicates
    if (!checkForDuplicates("otherPartiesDetails")) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading("posting_matter_others");

      // Post to appropriate endpoint
      let response;
      if (formType === "firm") {
        response = await PostAllData(
          access,
          getOtherPartiesDetails(),
          `${BASE_URL}/firm-lead/${id}/involved-person/`,
          false,
          "Other Party Added to Lead"
        );
      } else {
        response = await PostAllData(
          access,
          getOtherPartiesDetails(),
          `${BASE_URL}/file/${id}/opposer/`,
          false,
          "Other Party Added to Lead"
        );
      }

      // Handle success
      if (addingMore) {
        // Stay on the same step if adding more parties
        handleAddMore("otherPartiesDetails");
      } else {
        // Complete the form
        await onSubmit();
        toast.success(
          `${
            formType === "firm" ? "Lead" : "Matter"
          } created successfully with all details`
        );
        onClose();

        // Option to close or reset form could be added here
        // For now, we'll keep the form open on the final step
      }
    } catch (error) {
      console.error("Submit Other Party Details Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";

      if (error.response?.status === 400) {
        toast.warn("Duplicate other party details already exist.");
      } else {
        toast.error(`Failed to add other party: ${errorMessage}`);
      }

      // Handle API validation errors
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newFormErrors = { ...formErrors };
        const index = form.otherPartiesDetails.length - 1;

        Object.entries(apiErrors).forEach(([field, message]) => {
          newFormErrors[`otherPartiesDetails.${index}.${field}`] = message;
        });

        setFormErrors(newFormErrors);
      }
    } finally {
      setLoading(null);
      setIsSubmitting(false);
    }
  };

  // Handler for modal backdrop click
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      // Confirm before closing if there are changes
      if (hasFormChanges()) {
        if (window.confirm("Are you sure you want to close?")) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  // Check if form has any changes from initial state
  const hasFormChanges = () => {
    const initialForm = getInitialForm();

    // Check matter fields
    for (const key in form.matter) {
      if (
        initialForm.matter[key] &&
        form.matter[key].value !== initialForm.matter[key].value
      ) {
        return true;
      }
    }

    // If we have more than 1 entry in arrays or any entries with data
    if (form.clientDetails.length > 1) return true;
    if (form.otherPartiesDetails.length > 1) return true;

    // Check if any client fields have data
    const hasClientData = Object.values(form.clientDetails[0]).some(
      (field) => field.value !== ""
    );

    // Check if any other party fields have data
    const hasOtherPartyData = Object.values(form.otherPartiesDetails[0]).some(
      (field) => field.value !== ""
    );

    return hasClientData || hasOtherPartyData;
  };

  // Keyboard shortcut for form navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+Right Arrow to go forward
      if (e.altKey && e.key === "ArrowRight") {
        if (formStep < 3) {
          e.preventDefault();
          if (formStep === 1) submitMatterDetails();
          else if (formStep === 2) submitClientDetails();
        }
      }
      // Alt+Left Arrow to go back
      else if (e.altKey && e.key === "ArrowLeft") {
        if (formStep > 1) {
          e.preventDefault();
          setFormStep(formStep - 1);
        }
      }
      // Escape to close with confirmation if needed
      else if (e.key === "Escape") {
        e.preventDefault();
        if (hasFormChanges()) {
          if (window.confirm("Are you sure you want to close?")) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formStep, form, isSubmitting]);

  // Render form field based on its type
  const renderField = (field, section, index, key) => {
    const errorKey =
      index !== null ? `${section}.${index}.${key}` : `${section}.${key}`;

    const hasError = formErrors[errorKey];

    return (
      <TextInput
        key={`${section}-${index}-${key}`}
        label={field.label}
        value={field.value}
        type={field.type}
        desc={
          hasError ? (
            <span className="text-red-500">{formErrors[errorKey]}</span>
          ) : (
            field.desc
          )
        }
        className={`border-b ${hasError ? "border-red-500" : ""}`}
        labelStyle="card"
        changed={(value) => handleChange(section, index, key, value)}
        placeholder={field.label}
        tag={key}
        options={field.type === "dropdown" ? field.options : undefined}
        min={field.min}
        max={field.max}
        required={field.required}
      />
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-50 px-4 text-customGray"
      onClick={handleOutsideClick}
    >
      <div className="card rounded-lg p-6 shadow-lg w-full h-auto max-h-screen overflow-auto max-w-4xl bg-white relative">
        {/* Close button and keyboard shortcut hint */}
        <div className="absolute top-4 right-4 flex items-center">
          <span className="text-xs hidden md:flex btn btn-ghost btn mr-2">
            ESC to close
          </span>
          <button
            className="focus:outline-none reverse_card p-1 rounded-md"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X />
          </button>
        </div>

        {/* Title */}
        {title && (
          <h2 onClick={clickedTitle} className="text-2xl font-semibold mb-4">
            {title}
          </h2>
        )}

        {/* Progress tracker */}
        <FormProgress />

        {/* Form Content */}
        <div className="overflow-y-auto">
          {formStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-medium mb-3">Matter Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(form.matter).map(([key, field]) =>
                  renderField(field, "matter", null, key)
                )}
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <Button
                  disabled={isSubmitting || disabled}
                  onClick={onClose}
                  className="btn btn-danger "
                  text={`Cancel`}
                />
                <Button
                  loading={loading === "posting_matter_details"}
                  disabled={isSubmitting || disabled}
                  onClick={submitMatterDetails}
                  className="btn btn-success "
                  text={`Next`}
                />
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-medium">Client Details</h3>
                <div className="flex space-x-2">
                  <Button
                    loading={loading === "checking_client_name"}
                    disabled={loading === "checking_client_name"}
                    size="sm"
                    onClick={() => {
                      handleAddMore("clientDetails");
                      checkNames("client");
                    }}
                    className="btn btn-success"
                    text={`Add Another Client`}
                  />
                  {form.clientDetails.length > 1 && (
                    <Button
                      type="danger"
                      size="sm"
                      className="btn btn-danger "
                      onClick={() => handleRemoveLast("clientDetails")}
                      text={`Remove Last`}
                    />
                  )}
                </div>
              </div>

              {form.clientDetails.map((client, clientIndex) => (
                <div key={clientIndex} className="border p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Client {clientIndex + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(client).map(([key, field]) =>
                      renderField(field, "clientDetails", clientIndex, key)
                    )}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-y-2 w-full overflow-auto justify-end mt-6">
                {/* <Button
                  icon={<ArrowLeft size={20} />}
                  onClick={() => setFormStep(1)}
                  text={`Back`}
                  className="btn btn-outline "
                /> */}
                <div className="flex space-x-3">
                  {/* <Button
                    loading={loading === "posting_matter_client"}
                    disabled={isSubmitting || disabled}
                    onClick={() => submitClientDetails(true)}
                    text={`Save & Add Another`}
                    className="btn btn-success"
                  /> */}
                  <Button
                    icon={<ArrowRight size={20} />}
                    loading={loading === "posting_matter_client"}
                    disabled={isSubmitting || disabled}
                    onClick={() => submitClientDetails(false)}
                    text={`Next`}
                    className="btn btn-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-medium">Other Parties</h3>
                <div className="flex space-x-2">
                  <Button
                    loading={loading === "checking_other_pary_name"}
                    disabled={loading === "checking_other_pary_name"}
                    className="btn btn-success"
                    onClick={() => {
                      handleAddMore("otherPartiesDetails");
                      checkNames("other_person");
                    }}
                    text={`Add Another Party`}
                  />
                  {form.otherPartiesDetails.length > 1 && (
                    <Button
                      className="btn btn-danger"
                      size="sm"
                      onClick={() => handleRemoveLast("otherPartiesDetails")}
                      text={`Remove Last`}
                    />
                  )}
                </div>
              </div>

              {form.otherPartiesDetails.map((party, partyIndex) => (
                <div key={partyIndex} className="border p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Party {partyIndex + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(party).map(([key, field]) =>
                      renderField(field, "otherPartiesDetails", partyIndex, key)
                    )}
                  </div>
                </div>
              ))}
              <div className="w-full flex-col">
                <div className="flex flex-wrap gap-y-2 w-full overflow-auto  justify-end mt-6">
                  {/* <Button
                    onClick={() => setFormStep(2)}
                    text={`Back`}
                    icon={<ArrowLeft size={20} />}
                    className="btn-outline btn"
                  /> */}
                  <div className="flex space-x-3">
                    {/* <Button
                      loading={loading === "posting_matter_others"}
                      disabled={isSubmitting || disabled}
                      onClick={() => submitOtherPartiesDetails(true)}
                      text={`Save & Add Another`}
                      className="btn btn-success"
                    /> */}
                    <Button
                      loading={loading === "posting_matter_others"}
                      disabled={isSubmitting || disabled}
                      onClick={() => submitOtherPartiesDetails(false)}
                      value={buttonValue}
                      text={buttonValue || "Complete"}
                      className="btn btn-primary "
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional content passed as children */}
        {subChildren}
      </div>
    </div>
  );
};

export default LargeFormModal;
