"use client";
import { GripVertical, Hand, Move, MoveHorizontal, X } from "lucide-react";
import React, { useState, useRef } from "react";
import Button from "../reusables/buttons/Buttons";
import ResizableDiv from "./ReuseableDiv";

const DraggableModal = ({
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed border z-50 ">
      <div className="relative  w-96">
        <ResizableDiv mobileEnabled>
          <div className="card rounded-lg p-6 shadow-lg h-full  pointer-events-auto">
            <button
              className="absolute top-4 right-4 focus:outline-none"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X />
            </button>
            {title && (
              <h2 onClick={clickedTitle} className="text-2xl font-semibold">
                {title}
              </h2>
            )}

            {/* Modal Content */}
            <div
              className="overflow-auto p-4 h-full "
              style={{ height: `calc(100% - 60px)` }}
            >
              {onSubmit ? (
                <form
                  onSubmit={onSubmit}
                  className="flex h-full flex-col gap-y-3"
                >
                  <div className="h-full">{children}</div>
                  {customButton ? (
                    customButton
                  ) : (
                    <Button
                    type="submit"
                      className="btn btn-primary"
                      text={buttonValue}
                      disabled={disabled}
                      loading={loading}
                    />
                  )}
                  {subChildren && subChildren}
                </form>
              ) : (
                <div>{children}</div>
              )}
            </div>
          </div>
        </ResizableDiv>
      </div>
    </div>
  );
};

export default DraggableModal;
