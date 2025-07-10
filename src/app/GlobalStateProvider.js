"use client";
import { createContext, useContext, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [loading, setLoading] = useState();
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
        }}
      >
        {children}
      </GlobalStateContext.Provider>
    </>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
