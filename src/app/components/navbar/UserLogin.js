import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Button from "../buttons/Buttons";
import { validateFields } from "@/app/utils/syncs";

const UserLogin = ({ toggle = () => {} }) => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!loginForm.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(loginForm.email)) {
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
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (loginError) setLoginError("");
  };

  const userLogin = async () => {
    if (!validateForm()) return;
    if (!validateFields(loginForm)) return;

    setIsLoading(true);
    setLoginError("");

    try {
      // Simulate API call
      // const response = await authService.login(loginForm);
      // Handle successful login (redirect, store token, etc.)
      console.log("Login successful", loginForm);
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      userLogin();
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      {loginError && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
          {loginError}
        </div>
      )}

      <TextInput
        type="email"
        placeholder="Enter Email"
        value={loginForm.email}
        onChange={(e) => handleInputChange("email", e)}
        error={errors.email}
        onKeyPress={handleKeyPress}
        autoFocus
      />

      <TextInput
        type="password"
        placeholder="Enter Password"
        value={loginForm.password}
        onChange={(e) => handleInputChange("password", e)}
        error={errors.password}
        onKeyPress={handleKeyPress}
      />

      <div className="text-right">
        <button
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={() => {
            /* Add forgot password handler */
          }}
        >
          Forgot password?
        </button>
      </div>

      <Button
        text={isLoading ? "Signing in..." : "Continue"}
        className="btn w-full btn-primary"
        onClick={userLogin}
        disabled={isLoading}
      />

      <div className="flex items-center justify-center mt-2 text-xs w-full text-gray-500">
        Don't have an account?{" "}
        <button
          onClick={toggle}
          className="text-green-500 hover:text-green-600 font-semibold cursor-pointer ml-1"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default UserLogin;
