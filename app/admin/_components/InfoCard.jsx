import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React from "react";

function InfoCard({ title, value, description, sign }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {sign}
          {value}
        </p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default InfoCard;
