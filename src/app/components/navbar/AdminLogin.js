import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Button from "../buttons/Buttons";
import { validateFields } from "@/app/utils/syncs";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });

  const AdminLogin = async () => {
    if (!validateFields(adminForm)) return;
  };
  return (
    <div className="flex flex-col gap-y-3 ">
      <span>
        <TextInput
          type="email"
          placeholder="Enter Email"
          value={adminForm.email}
          onChange={(e) => {
            setAdminForm((prev) => ({
              ...prev,
              email: e,
            }));
          }}
        />
      </span>
      <span>
        <TextInput
          type="password"
          placeholder="Enter Password"
          value={adminForm.password}
          onChange={(e) => {
            setAdminForm((prev) => ({
              ...prev,
              password: e,
            }));
          }}
        />
      </span>
      <span>
        <Button
          text="Continue"
          className="btn w-full btn-primary"
          onClick={() => {
            AdminLogin();
          }}
        />
      </span>
    </div>
  );
};

export default AdminLogin;
