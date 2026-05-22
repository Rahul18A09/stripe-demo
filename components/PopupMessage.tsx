"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const messages = {
  login: "Login successful.",
  signup: "Signup successful.",
  logout: "Logout successful.",
};

type PopupMessageProps = {
  type?: keyof typeof messages;
};

export default function PopupMessage({ type }: PopupMessageProps) {
  const [visible, setVisible] = useState(Boolean(type));

  useEffect(() => {
    if (!type) {
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), 3000);

    return () => window.clearTimeout(timer);
  }, [type]);

  if (!type || !visible) {
    return null;
  }

  return (
    <div className="fixed right-5 top-20 z-50 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 shadow-lg">
      <CheckCircle2 size={20} className="text-emerald-600" />
      {messages[type]}
    </div>
  );
}
