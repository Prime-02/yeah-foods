"use client";
import { getCurrentUser } from "@/lib/appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [loading, setLoading] = useState();
  const [currentUser, setCurrentUser] = useState({});

  // Handle successful login/signup
  const fetchUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error refreshing user session:", error);
    }
  };

  useEffect(()=>{
    fetchUserData()
  }, [])

  return (
    <>
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={2}
      />
      <GlobalStateContext.Provider
        value={{
          loading,
          setLoading,
          currentUser,
          setCurrentUser,
          fetchUserData
        }}
      >
        {children}
      </GlobalStateContext.Provider>
    </>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
