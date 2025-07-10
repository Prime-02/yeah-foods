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

  const handleSignUp = async () => {
    // Basic validation
    const newErrors = {};

    if (!signupForm.username.trim()) {
      newErrors.username = "Username is required";
    } else if (signupForm.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!signupForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(signupForm.email)) {
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

    // If validation passes
    if (!validateFields(signupForm)) return;
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
      // Handle error (show error message, etc.)
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      <span>
        <TextInput
          type="text"
          placeholder="Username"
          value={signupForm.username}
          onChange={(e) => {
            setSignupForm((prev) => ({
              ...prev,
              username: e,
            }));
          }}
          error={errors.username}
        />
      </span>
      <span>
        <TextInput
          type="email"
          placeholder="Enter Email"
          value={signupForm.email}
          onChange={(e) => {
            setSignupForm((prev) => ({
              ...prev,
              email: e,
            }));
          }}
          error={errors.email}
        />
      </span>
      <span>
        <TextInput
          type="password"
          placeholder="Enter Password"
          value={signupForm.password}
          onChange={(e) => {
            setSignupForm((prev) => ({
              ...prev,
              password: e,
            }));
          }}
          error={errors.password}
        />
      </span>
      <span>
        <TextInput
          type="password"
          placeholder="Confirm Password"
          value={signupForm.confirmPassword}
          onChange={(e) => {
            setSignupForm((prev) => ({
              ...prev,
              confirmPassword: e,
            }));
          }}
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
      <span
        onClick={toggle}
        className="flex items-center justify-center mt-2 text-xs w-full"
      >
        Already have an account?{" "}
        {
          <span className="text-green-500 hover:text-green-600 font-semibold cursor-pointer">
            Login
          </span>
        }
      </span>
    </div>
  );
};

export default UserSignUp;
