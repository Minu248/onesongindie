import { useState, useCallback } from "react";
import { ANIMATION_TIMING } from "@/config/constants";

export const useToast = () => {
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((message: string, duration: number = ANIMATION_TIMING.TOAST_DISPLAY_DURATION) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), duration);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage("");
  }, []);

  return {
    toastMessage,
    showToast,
    hideToast,
    isVisible: !!toastMessage,
  };
}; 