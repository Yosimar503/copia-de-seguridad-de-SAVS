import React, { useRef, useState } from "react";
import { motion } from "motion/react";

export function Magnetic({ children, intensity = 0.3, springOptions, className, style }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * intensity, y: middleY * intensity });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  
  const defaultSpring = { type: "spring", stiffness: 150, damping: 15, mass: 0.1 };

  return (
    <motion.div
      style={{ display: "inline-block", ...style }}
      className={className}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={springOptions || defaultSpring}
    >
      {children}
    </motion.div>
  );
}

export default Magnetic;
