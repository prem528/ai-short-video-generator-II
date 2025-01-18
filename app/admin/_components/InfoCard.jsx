import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React from "react";

function InfoCard({ title, value, description, sign }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8"> 
      <div className="flex flex-col items-center justify-center mb-4"> 
        <h3 className="text-lg font-semibold text-gray-700 text-center">{title}</h3> 
      </div>
      <div className="text-center"> 
        <p className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl lg:text-4xl">
          {sign}
          {value}
        </p>
        <p className="text-sm text-gray-500 md:text-base">{description}</p>
      </div>
    </div>
  );
}

export default InfoCard;