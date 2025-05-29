// src/components/LoadingSpinner.tsx
import React from "react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: "small" | "medium" | "large";
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = "medium",
  color = "#3b82f6",
}) => {
  const sizeClasses = {
    small: "h-5 w-5 border-2",
    medium: "h-8 w-8 border-[3px]",
    large: "h-12 w-12 border-4",
  };

  const spinnerElement = (
    <div
      className={`rounded-full border-transparent ${sizeClasses[size]}`}
      style={{
        borderTopColor: color,
        borderBottomColor: color,
        animation: "spin 1s linear infinite",
      }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">{spinnerElement}</div>
    );
  }

  return <div className="flex justify-center items-center">{spinnerElement}</div>;
};
