"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, signOut } from "@/lib/appwrite";
import { User, Mail, Calendar, Shield, LogOut, Loader } from "lucide-react";
import Button from "../buttons/Buttons";



const UserProfile = ({ onClose, onSignOut }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user profile");
        // If user fetch fails, they might not be logged in
        setTimeout(() => {
          onClose();
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [onClose]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setError(null);
      await signOut();
      onSignOut();
      onClose();
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-gray-400 mb-4" size={32} />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">No user data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
        <p className="text-gray-500">{user.email}</p>
      </div>

      {/* Profile Details */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid gap-3">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              </div>
              <div className="flex-shrink-0">
                {user.emailVerification ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Registration Date */}
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700">Member Since</p>
                <p className="text-sm text-gray-600">
                  {formatDate(user.registration)}
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-sm text-gray-600">
                  {user.status ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${
                    user.status ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-400 rounded-sm flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700">User ID</p>
                <p className="text-xs text-gray-500 font-mono break-all">
                  {user.$id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Labels/Roles (if any) */}
        {user.labels && user.labels.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Roles</h4>
            <div className="flex flex-wrap gap-2">
              {user.labels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 btn btn-secondary"
          text="Close"
          disabled={signingOut}
        />
        <Button
          onClick={handleSignOut}
          variant="danger"
          className="flex-1 btn btn-primary"
          text={signingOut ? "Signing Out..." : "Sign Out"}
          icon={signingOut ? <Loader className="animate-spin" size={16} /> : <LogOut size={16} />}
          loading={signingOut}
          disabled={signingOut}
        />
      </div>
    </div>
  );
};

export default UserProfile;