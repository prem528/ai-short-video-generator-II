"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";

function Provider({ children }) {
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      isNewUser();
    }
    setLoading(false);
  }, [user]);

  const isNewUser = async () => {
    await fetch("/api/setUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
      }),
    });
  };

  if (loading) {
    return null; // Prevent rendering until loading is complete
  }

  return <>{children}</>;
}

export default Provider;
