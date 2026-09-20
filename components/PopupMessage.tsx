"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";

const messages = {
  login: "Login successful.",
  signup: "Signup successful.",
  confirmed: "Email confirmed. Your account is ready.",
  logout: "Logout successful.",
  "check-email": "Account created. Please check your email to confirm signup.",
};

type PopupMessageProps = {
  type?: keyof typeof messages;
};

export default function PopupMessage({ type }: PopupMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const message = messageRef.current;
    if (!type || !message) {
      return;
    }

    message.hidden = false;
    const timer = window.setTimeout(() => {
      message.hidden = true;
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [type]);

  if (!type) {
    return null;
  }

  return (
    <div
      ref={messageRef}
      className="fixed right-5 top-20 z-50 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 shadow-lg"
    >
      <CheckCircle2 size={20} className="text-emerald-600" />
      {messages[type]}
    </div>
  );
}
