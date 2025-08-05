import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Button from "../buttons/Buttons";
import { validateFields } from "@/app/utils/syncs";
import { useGlobalState } from "@/app/GlobalStateProvider";
import { signIn } from "@/lib/appwrite";

const UserLogin = ({ toggle = () => {} }) => {
  const { loading, setLoading } = useGlobalState();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const validateForm = () => {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    if (!loginForm.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(loginForm.email)
    ) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!loginForm.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (loginForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field] || errors.general) {
      setErrors((prev) => ({ ...prev, [field]: "", general: "" }));
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault(); // Handle form submission
    if (!validateForm()) return;
    // Optional: Remove or clarify validateFields if redundant
    if (!validateFields(loginForm)) return;

    setLoading("logging_in");
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const response = await signIn(loginForm.email, loginForm.password);
      console.log("Login successful:", response);
      // Handle successful login (e.g., store token, redirect)
      // Example: localStorage.setItem("token", response.token);
      // Example: window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          error.message || "Invalid email or password. Please try again.",
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-y-4">
      {errors.general && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
          {errors.general}
        </div>
      )}

      <TextInput
        type="email"
        placeholder="Enter Email"
        value={loginForm.email}
        onChange={(e) => handleInputChange("email", e)}
        error={errors.email}
        autoFocus
      />

      <TextInput
        type="password"
        placeholder="Enter Password"
        value={loginForm.password}
        onChange={(e) => handleInputChange("password", e)}
        error={errors.password}
      />

      <div className="text-right">
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={() => {
            console.log("Navigate to forgot password page");
            // Add navigation to forgot password page, e.g., navigate("/forgot-password")
          }}
        >
          Forgot password?
        </button>
      </div>

      <Button
        text={loading === "logging_in" ? "Signing in..." : "Continue"}
        className="btn w-full btn-primary"
        onClick={handleLogin}
        disabled={loading === "logging_in"}
      />

      <div className="flex items-center justify-center mt-2 text-xs w-full text-gray-500">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={toggle}
          className="text-green-500 hover:text-green-600 font-semibold cursor-pointer ml-1"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default UserLogin;
