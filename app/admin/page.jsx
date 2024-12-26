"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl text-primary">Admin Dashboard</h2>
      </div>
    </div>
  );
}
