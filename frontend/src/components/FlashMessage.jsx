import { useEffect } from "react";

const FlashMessage = ({ message, type = "success", onClose, ms = 2500 }) => {
  let bgColor;

  switch (type) {
    case "success":
      bgColor = "bg-green-500";
      break;
    case "warning":
      bgColor = "bg-yellow-500";
      break;
    case "error":
      bgColor = "bg-red-500";
      break;
    default:
      bgColor = "bg-gray-500";
  }

  // auto-dismiss after ms
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, ms);
    return () => clearTimeout(timer);
  }, [message, ms, onClose]);

  if (!message) return null;

  return (
    <div
      className={`${bgColor} text-white p-3 rounded mb-4 flex justify-between items-center`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold">
        ×
      </button>
    </div>
  );
};

export default FlashMessage;
