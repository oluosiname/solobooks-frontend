"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    $crisp: unknown[];
    CRISP_WEBSITE_ID: string;
  }
}

export function CrispChat() {
  const { user, isAuthenticated } = useAuth();

  // Initialize Crisp
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!websiteId) return;

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  // Set user data when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    console.log({ user });

    window.$crisp.push(["set", "user:email", [user.email]]);
    // window.$crisp.push(["set", "user:nickname", [user.fullName]]);
    window.$crisp.push([
      "set",
      "session:data",
      [
        [
          ["plan", user.plan],
          ["on-trial", user.onTrial ? "yes" : "no"],
          ["user-id", user.id],
        ],
      ],
    ]);

    const segments = [user.plan];
    if (user.onTrial) segments.push("trial");
    window.$crisp.push(["set", "session:segments", [segments]]);
  }, [isAuthenticated, user]);

  return null;
}
