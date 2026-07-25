"use client";

import React from "react";

export default function BackgroundLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="relative z-10">{children}</div>
    </div>
  );
}
