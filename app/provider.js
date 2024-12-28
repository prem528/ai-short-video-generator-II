"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect } from "react";

function Provider({ children }) {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      isNewUser();
    }
  }, [user]);

  const isNewUser = async () => {
    // Call the API route to handle user creation and role assignment
    const response = await fetch("/api/setUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
      }),
    });
  };

  return <div>{children}</div>;
}

export default Provider;
