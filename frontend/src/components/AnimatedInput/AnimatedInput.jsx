import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import BorderBeam from "../BorderBeam/BorderBeam";
import "./AnimatedInput.css";

const EASE_IN_OUT_CUBIC_X1 = 0.4;
const EASE_IN_OUT_CUBIC_Y1 = 0;
const EASE_IN_OUT_CUBIC_X2 = 0.2;
const EASE_IN_OUT_CUBIC_Y2 = 1;
const RADIX_BASE_36 = 36;
const RANDOM_ID_START_INDEX = 2;
const RANDOM_ID_LENGTH = 9;

const LABEL_TRANSITION = {
  duration: 0.28,
  ease: [
    EASE_IN_OUT_CUBIC_X1,
    EASE_IN_OUT_CUBIC_Y1,
    EASE_IN_OUT_CUBIC_X2,
    EASE_IN_OUT_CUBIC_Y2,
  ],
};

export default function AnimatedInput({
  value,
  defaultValue = "",
  onChange,
  label,
  placeholder = "",
  disabled = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
  icon,
  type = "text",
  id,
  name,
  required
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const val = isControlled ? value : internalValue;
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = !!val || isFocused;
  const shouldReduceMotion = useReducedMotion();
  
  const generatedId = `animated-input-${Math.random().toString(RADIX_BASE_36).substring(RANDOM_ID_START_INDEX, RANDOM_ID_LENGTH)}`;
  const inputId = id || generatedId;

  const getLabelAnimation = () => {
    if (shouldReduceMotion) return {};
    if (isFloating) {
      return {
        y: -24,
        scale: 0.85,
        color: "var(--color-brand, #eab308)",
      };
    }
    return { y: 0, scale: 1, color: "#9ca3af" };
  };

  const getLabelStyle = () => {
    if (!shouldReduceMotion) return {};
    if (isFloating) {
      return {
        transform: "translateY(-24px) scale(0.85)",
        color: "var(--color-brand, #eab308)",
      };
    }
    return {
      transform: "translateY(0) scale(1)",
      color: "#9ca3af",
    };
  };

  return (
    <div className={`animated-input-wrapper relative flex items-center ${className}`}>
      {/* Animated Gold Border (Smooth) */}
      <BorderBeam 
        size={40} 
        duration={12} 
        colorFrom="rgba(234, 179, 8, 0)" 
        colorTo="rgba(234, 179, 8, 1)" 
        borderWidth={1} 
        className="animated-input-beam" 
      />
      
      {icon && (
        <span aria-hidden="true" className="animated-icon-wrapper">
          {icon}
        </span>
      )}
      
      <input
        aria-label={label}
        className={`animated-input-field ${icon ? "has-icon" : ""} ${inputClassName}`}
        disabled={disabled}
        id={inputId}
        name={name}
        required={required}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => {
          if (!isControlled) {
            setInternalValue(e.target.value);
          }
          if (onChange) onChange(e);
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={isFloating ? placeholder : ""}
        ref={inputRef}
        type={type}
        value={val}
      />
      
      <motion.label
        animate={getLabelAnimation()}
        className={`pointer-events-none animated-input-label ${isFloating ? "floating" : ""} ${labelClassName}`}
        htmlFor={inputId}
        style={{
          zIndex: 2,
          ...getLabelStyle(),
        }}
        transition={shouldReduceMotion ? { duration: 0 } : LABEL_TRANSITION}
      >
        {label}
      </motion.label>
    </div>
  );
}
