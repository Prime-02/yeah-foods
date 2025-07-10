import React, { useState, useRef, useEffect } from "react";

const ResizableDiv = ({ children, className = "", mobileEnabled = false }) => {
  const [dimensions, setDimensions] = useState({
    width: "100%",
    height: className.includes("h-auto") ? "auto" : "auto", // Initialize as auto if h-auto class is present
  });

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const divRef = useRef(null);
  const parentRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (divRef.current && contentRef.current) {
      parentRef.current = divRef.current.parentElement;

      if (!isModified) {
        const contentHeight = contentRef.current.scrollHeight;
        setDimensions((prev) => ({
          ...prev,
          height: className.includes("h-auto") ? "auto" : contentHeight,
        }));
      }
    }
  }, [children, isModified, className]);
  const getRelativeCoordinates = (clientX, clientY) => {
    if (!parentRef.current) return { x: clientX, y: clientY };

    const parentRect = parentRef.current.getBoundingClientRect();
    return {
      x: clientX - parentRect.left,
      y: clientY - parentRect.top,
    };
  };

  const handleStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const isTouchEvent = e.touches;
    if (!mobileEnabled && isTouchEvent) return;

    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    if (direction) {
      setResizing(direction);
    } else {
      setIsDragging(true);
    }

    const { x, y } = getRelativeCoordinates(clientX, clientY);
    setDragStart(
      direction ? { x, y } : { x: x - position.x, y: y - position.y }
    );
    setIsModified(true);
  };

  const handleMove = (e) => {
    if (!isDragging && !resizing) return;

    const isTouchEvent = e.touches;
    if (!mobileEnabled && isTouchEvent) return;

    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    if (clientX === undefined || clientY === undefined) return;

    const { x: relX, y: relY } = getRelativeCoordinates(clientX, clientY);

    if (resizing) {
      const deltaX = relX - dragStart.x;
      const deltaY = relY - dragStart.y;

      setDimensions((prev) => {
        const newDimensions = { ...prev };

        if (typeof prev.width === "string") {
          const parentWidth = parentRef.current?.clientWidth || 0;
          newDimensions.width = parentWidth;
        }
        if (typeof prev.height === "string" && prev.height !== "auto") {
          const parentHeight = parentRef.current?.clientHeight || 0;
          newDimensions.height = parentHeight;
        }

        if (resizing.includes("e")) {
          newDimensions.width = Math.max(50, newDimensions.width + deltaX);
        } else if (resizing.includes("w")) {
          const newWidth = Math.max(50, newDimensions.width - deltaX);
          if (newWidth !== newDimensions.width) {
            setPosition((prevPos) => ({
              ...prevPos,
              x: prevPos.x + (newDimensions.width - newWidth),
            }));
            newDimensions.width = newWidth;
          }
        }

        if (resizing.includes("s")) {
          newDimensions.height = Math.max(50, newDimensions.height + deltaY);
        } else if (resizing.includes("n")) {
          const newHeight = Math.max(50, newDimensions.height - deltaY);
          if (newHeight !== newDimensions.height) {
            setPosition((prevPos) => ({
              ...prevPos,
              y: prevPos.y + (newDimensions.height - newHeight),
            }));
            newDimensions.height = newHeight;
          }
        }

        return newDimensions;
      });

      setDragStart({ x: relX, y: relY });
    } else if (isDragging) {
      setPosition({
        x: relX - dragStart.x,
        y: relY - dragStart.y,
      });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setResizing(null);
    setIsTapped(false);
  };

  const resetSizeAndPosition = () => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setDimensions({
        width: "100%",
        height: contentHeight,
      });
    } else {
      setDimensions({
        width: "100%",
        height: "auto",
      });
    }
    setPosition({ x: 0, y: 0 });
    setIsModified(false);
  };

  useEffect(() => {
    if (isDragging || resizing) {
      document.addEventListener("mousemove", handleMove);
      if (mobileEnabled) {
        document.addEventListener("touchmove", handleMove, { passive: false });
      }
      document.addEventListener("mouseup", handleEnd);
      if (mobileEnabled) {
        document.addEventListener("touchend", handleEnd);
      }
    } else {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, resizing, dragStart, mobileEnabled]);

  useEffect(() => {
    const isDefault =
      dimensions.width === "100%" &&
      (dimensions.height === "auto" ||
        dimensions.height === contentRef.current?.scrollHeight) &&
      position.x === 0 &&
      position.y === 0;
    setIsModified(!isDefault);
  }, [dimensions, position]);

  const containerStyle = {
    position: "absolute",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    userSelect: "none",
    touchAction: mobileEnabled ? "none" : "auto",
    width: dimensions.width,
    height: dimensions.height === "auto" ? "auto" : `${dimensions.height}px`,
    left: `${position.x}px`,
    top: `${position.y}px`,
    cursor: "default",
    border: isHovered || isTapped ? "1px dashed rgba(0, 0, 0, 0.3)" : "none",
    zIndex: isHovered || isTapped || isDragging || resizing ? 9999 : "auto",
    transition: "z-index 0.2s ease",
  };

  const handleStyle = {
    position: "absolute",
    background: "transparent",
    zIndex: 10,
    touchAction: mobileEnabled ? "none" : "auto",
    opacity: isHovered || isTapped ? 1 : 0,
    transition: "opacity 0.2s ease",
  };

  const resizeHandleCommonStyle = {
    position: "absolute",
    background: "rgba(0, 0, 0, 0.3)",
    zIndex: 10,
    opacity: isHovered || isTapped ? 1 : 0,
    transition: "opacity 0.2s ease",
  };

  const resetButtonStyle = {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "5px 10px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    zIndex: 20,
    display: isModified ? "block" : "none",
    opacity: isHovered || isTapped ? 1 : 0,
    transition: "opacity 0.2s ease",
  };

  const dragHandleStyle = {
    width: "20px",
    height: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "4px",
    cursor: "move",
    zIndex: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "12px",
    opacity: isHovered || isTapped ? 1 : 0,
    transition: "opacity 0.2s ease",
  };

  const contentWrapperStyle = {
    height: dimensions.height === "auto" ? "auto" : "100%",
    width: "100%",
  };

  return (
    <div
      className={`${className}`}
      ref={divRef}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => {
        setIsTapped(true);
        if (divRef.current) {
          divRef.current.style.zIndex = 9999;
        }
      }}
      onTouchEnd={() => {
        setIsTapped(false);
        if (!isDragging && !resizing && divRef.current) {
          divRef.current.style.zIndex = "auto";
        }
      }}
    >
      {/* Drag handle button */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={dragHandleStyle}
        onMouseDown={(e) => handleStart(e)}
        onTouchStart={mobileEnabled ? (e) => handleStart(e) : undefined}
        title="Drag to reposition"
      >
        ≡
      </div>

      <div ref={contentRef} style={contentWrapperStyle}>
        {children}
      </div>

      {/* Resize handles */}
      <div
        style={{
          ...resizeHandleCommonStyle,
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "30%",
          height: "2px",
        }}
      />
      <div
        style={{
          ...resizeHandleCommonStyle,
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          width: "2px",
          height: "30%",
        }}
      />
      <div
        style={{
          ...resizeHandleCommonStyle,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "30%",
          height: "2px",
        }}
      />
      <div
        style={{
          ...resizeHandleCommonStyle,
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
          width: "2px",
          height: "30%",
        }}
      />

      {/* Interactive resize areas */}
      <div
        style={{
          ...handleStyle,
          top: 0,
          left: 0,
          right: 0,
          height: mobileEnabled ? "15px" : "10px",
          cursor: "ns-resize",
        }}
        onMouseDown={(e) => handleStart(e, "n")}
        onTouchStart={mobileEnabled ? (e) => handleStart(e, "n") : undefined}
      />
      <div
        style={{
          ...handleStyle,
          top: 0,
          right: 0,
          width: mobileEnabled ? "15px" : "10px",
          height: mobileEnabled ? "15px" : "10px",
          cursor: "nesw-resize",
        }}
        onMouseDown={(e) => handleStart(e, "ne")}
        onTouchStart={mobileEnabled ? (e) => handleStart(e, "ne") : undefined}
      />
      <div
        style={{
          ...handleStyle,
          top: 0,
          right: 0,
          bottom: 0,
          width: mobileEnabled ? "15px" : "10px",
          cursor: "ew-resize",
        }}
        onMouseDown={(e) => handleStart(e, "e")}
        onTouchStart={mobileEnabled ? (e) => handleStart(e, "e") : undefined}
      />
      <div
        style={{
          ...handleStyle,
          bottom: 0,
          right: 0,
          width: mobileEnabled ? "15px" : "10px",
          height: mobileEnabled ? "15px" : "10px",
          cursor: "nwse-resize",
        }}
        onMouseDown={(e) => handleStart(e, "se")}
        onTouchStart={mobileEnabled ? (e) => handleStart(e, "se") : undefined}
      />
      <div
        style={{
          ...handleStyle,
          bottom: 0,
          left: 0,
          right: 0,
          height: mobileEnabled ? "15px" : "10px",
          cursor: "ns-resize",
        }}
        onMouseDown={(e) => handleStart(e, "s")}
        onTouchStart={mobileEnabled ? (e) => handleStart(e, "s") : undefined}
      />
      <div
        style={{
          ...handleStyle,
          bottom: 0,
          left: 0,
          width: mobileEnabled ? "15px" : "10px",
          height: mobileEnabled ? "15px" : "10px",
          cursor: "nesw-resize",
        }}
        onMouseDown={(e) => handleStart(e, "sw")}
        onTouchStart={mobileEnabled ? (e) => handleStart(e, "sw") : undefined}
      />
      <div
        style={{
          ...handleStyle,
          top: 0,
          left: 0,
          bottom: 0,
          width: mobileEnabled ? "15px" : "10px",
          cursor: "ew-resize",
        }}
        onMouseDown={(e) => handleStart(e, "w")}
        onTouchStart={mobileEnabled ? (e) => handleStart(e, "w") : undefined}
      />
      <div
        style={{
          ...handleStyle,
          top: 0,
          left: 0,
          width: mobileEnabled ? "15px" : "10px",
          height: mobileEnabled ? "15px" : "10px",
          cursor: "nwse-resize",
        }}
        onMouseDown={(e) => handleStart(e, "nw")}
        onTouchStart={mobileEnabled ? (e) => handleStart(e, "nw") : undefined}
      />

      {isModified && (
        <button
          style={resetButtonStyle}
          onClick={resetSizeAndPosition}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default ResizableDiv;
