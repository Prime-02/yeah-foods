import React from "react";
import { Loader } from "../Loader/Loader";

const Button = ({
  icon,
  onClick,
  className = "",
  text = "",
  loading,
  disabled,
  title,
  type = "button",
}) => {
  return (
    <div
      title={title}
      type={type}
      disabled={disabled}
      className={` ${className} cursor-pointer  min-w-fit min-h-fit flex items-center justify-center rounded-full active:translate-y-1  focus:outline-none transition duration-200 shadow-md`}
      onClick={onClick}
    >
      {loading && disabled ? (
        <Loader smaillerSize={true} />
      ) : (
        <span className="flex items-center space-x-2">
          {icon}
          {text && <span>{text}</span>}
        </span>
      )}
    </div>
  );
};

export default Button;
