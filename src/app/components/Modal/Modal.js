import { Info, X } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../buttons/Buttons";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  disabled,
  loading,
  clickedTitle,
  buttonValue,
  subChildren,
  customButton,
  className,
}) => {
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50  px-4 text-customGray"
          onClick={handleOutsideClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`bg-white rounded-lg p-6 shadow-lg w-full relative max-h-screen overflow-auto ${
              className?.includes("max-w-")
                ? className
                : `${className} max-w-md`
            }`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{
              type: "tween",
              ease: "easeOut",
              duration: 0.3,
            }}
          >
            <button
              className="absolute top-4 right-4 focus:outline-none"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X />
            </button>
            {title && (
              <h2
                onClick={clickedTitle}
                className="text-2xl font-semibold mb-4"
              >
                {title}
              </h2>
            )}
            {onSubmit ? (
              <form onSubmit={onSubmit} className="flex flex-col gap-y-3">
                <div>{children}</div>
                {customButton ? (
                  customButton
                ) : (
                  <span className="w-full">
                    {buttonValue !== "" && (
                      <Button
                        type="submit"
                        className="btn-primary btn w-full"
                        text={buttonValue}
                        disabled={disabled}
                        loading={loading}
                      />
                    )}
                  </span>
                )}
                {subChildren && subChildren}
              </form>
            ) : (
              <div>{children}</div>
            )}
            <span className="text-xs animate-pulse  flex items-center justify-center gap-x-1 mt-5">
              <Info size={18} /> Click outside the modal to close it.
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
