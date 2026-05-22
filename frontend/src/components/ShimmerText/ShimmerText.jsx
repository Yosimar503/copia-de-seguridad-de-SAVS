import React from 'react';
import './ShimmerText.css';

export default function ShimmerText({ 
  text, 
  className = "",
  as: Component = "span",
  shimmerWidth, // Destructure to filter out
  ...props
}) {
  return (
    <div className="shimmer-wrapper">
      <Component className={`shimmer-text ${className}`} {...props}>
        {text}
      </Component>
    </div>
  );
}
