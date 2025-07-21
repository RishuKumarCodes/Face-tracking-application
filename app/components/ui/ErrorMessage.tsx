import React from "react";

interface ErrorMessageProps {
  error: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onDismiss,
}) => {
  if (!error) return null;

  return (
    <div
      className={`bg-red-600 text-white p-4 rounded-lg mb-6 border-l-4 border-red-400 absolute z-50 w-[90%] mx-[5%] my-5`}
    >
      <div className="flex items-center justify-between">
        <div>
          <strong>Error:</strong> {error}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-200 hover:text-white text-xl font-bold"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
