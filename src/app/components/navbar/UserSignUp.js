import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Button from "../buttons/Buttons";
import { validateFields } from "@/app/utils/syncs";
import { useGlobalState } from "@/app/GlobalStateProvider";
import { createUser } from "@/lib/appwrite";

const UserSignUp = ({ toggle = () => {} }) => {
  const { loading, setLoading } = useGlobalState();
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setSignupForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignUp = async (e) => {
    e?.preventDefault(); // Handle form submission
    const newErrors = {};

    if (!signupForm.username.trim()) {
      newErrors.username = "Username is required";
    } else if (signupForm.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!signupForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(signupForm.email)
    ) {
      newErrors.email = "Email is invalid";
    }

    if (!signupForm.password) {
      newErrors.password = "Password is required";
    } else if (signupForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading("creating_user");
    try {
      const createdUser = await createUser(
        signupForm.email,
        signupForm.password,
        signupForm.username
      );
      console.log("Registration data:", createdUser);
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({
        general: error.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-y-3">
      {errors.general && (
        <div className="text-red-500 text-sm">{errors.general}</div>
      )}
      <span>
        <TextInput
          type="text"
          placeholder="Username"
          value={signupForm.username}
          onChange={(e) => handleInputChange("username", e)}
          error={errors.username}
        />
      </span>
      <span>
        <TextInput
          type="email"
          placeholder="Enter Email"
          value={signupForm.email}
          onChange={(e) => handleInputChange("email", e)}
          error={errors.email}
        />
      </span>
      <span>
        <TextInput
          type="password"
          placeholder="Enter Password"
          value={signupForm.password}
          onChange={(e) => handleInputChange("password", e)}
          error={errors.password}
        />
      </span>
      <span>
        <TextInput
          type="password"
          placeholder="Confirm Password"
          value={signupForm.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e)}
          error={errors.confirmPassword}
        />
      </span>
      <span>
        <Button
          text="Sign Up"
          className="btn w-full btn-primary"
          onClick={handleSignUp}
          loading={loading === "creating_user"}
          disabled={loading === "creating_user"}
        />
      </span>
      <span className="flex items-center justify-center mt-2 text-xs w-full">
        Already have an account?{" "}
        <button
          onClick={toggle}
          className="text-green-500 hover:text-green-600 font-semibold cursor-pointer"
        >
          Login
        </button>
      </span>
    </form>
  );
};

export default UserSignUp;
