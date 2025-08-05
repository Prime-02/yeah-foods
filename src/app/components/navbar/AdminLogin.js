import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Button from "../buttons/Buttons";
import { validateFields } from "@/app/utils/syncs";
import { toast } from "react-toastify";
import { adminSignIn } from "@/lib/appwrite";

const AdminLogin = ({ onClose, onSuccess }) => {
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async () => {
    // Validate form fields
    if (!validateFields(adminForm)) {
      toast.error("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password length validation
    if (adminForm.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // Attempt admin sign in
      const response = await adminSignIn(adminForm.email, adminForm.password);
      
      if (response) {
        // Success
        toast.success("Admin login successful!");
        
        // Clear form
        setAdminForm({
          email: "",
          password: "",
        });

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response);
        }

        // Close modal
        if (onClose) {
          onClose();
        }
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      
      // Handle specific error messages
      let errorMessage = "Login failed. Please try again.";
      
      if (error.message) {
        if (error.message.includes("Invalid credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes("user_not_found")) {
          errorMessage = "Admin account not found. Please contact support.";
        } else if (error.message.includes("user_blocked")) {
          errorMessage = "Account has been blocked. Please contact support.";
        } else if (error.message.includes("too_many_requests")) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleAdminLogin();
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* Email Input */}
      <div>
        <TextInput
          type="email"
          placeholder="Enter Admin Email"
          value={adminForm.email}
          onChange={(e) => {
            setAdminForm((prev) => ({
              ...prev,
              email: e,
            }));
          }}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          autoComplete="email"
          required
        />
      </div>

      {/* Password Input */}
      <div>
        <TextInput
          type="password"
          placeholder="Enter Admin Password"
          value={adminForm.password}
          onChange={(e) => {
            setAdminForm((prev) => ({
              ...prev,
              password: e,
            }));
          }}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          autoComplete="current-password"
          required
        />
      </div>

      {/* Login Button */}
      <div>
        <Button
          text={isLoading ? "Signing In..." : "Continue"}
          className="btn w-full btn-primary"
          onClick={handleAdminLogin}
          loading={isLoading}
          disabled={isLoading || !adminForm.email || !adminForm.password}
        />
      </div>

      {/* Admin Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mt-3">
          Admin access only. Contact support if you need assistance.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;