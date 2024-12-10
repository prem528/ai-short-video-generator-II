"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectDuration({ onUserSelect }) {
  const options = ["15 seconds", "30 seconds", "60 seconds"];

  const [selectedOption, setSelectedOption] = useState();

  const handleValueChange = (value) => {
    setSelectedOption(value);
    if (onUserSelect) {
      onUserSelect("duration", value);
    }
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl text-primary">Duration</h2>
      <p className="text-gray-500">What is the duration of the video?</p>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full mt-2 text-lg">
          <SelectValue placeholder="Select Duration" />
        </SelectTrigger>
        <SelectContent>
          {options.map((item, index) => (
            <SelectItem key={index} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default SelectDuration;
