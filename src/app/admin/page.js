"use client";

import React, { useState, useEffect } from "react";
import { Users, UserCheck, AlertCircle, CheckCircle } from "lucide-react";
import { getAllUsers, makeUserAdmin } from "@/lib/appwrite"; // Fixed function name
import { toast } from "react-toastify";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userList = await getAllUsers(); // Fixed function name
      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  const handleMakeAdmin = async (userId) => {
    try {
      const updatedUser = await makeUserAdmin(userId);
      if (updatedUser) {
        loadUsers(); // Reload users to reflect changes
        toast.success("User successfully promoted to admin");
      }
    } catch (error) {
      console.error("Error making user admin:", error);
      toast.error("Failed to promote user to admin");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.$id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {user.username || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.email || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.isAdmin
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.isAdmin ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!user.isAdmin && (
                      <button
                        onClick={() => handleMakeAdmin(user.userId)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        <UserCheck className="w-4 h-4" />
                        Make Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;