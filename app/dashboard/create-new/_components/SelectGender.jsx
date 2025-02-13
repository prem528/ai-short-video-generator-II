"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectGender({ onUserSelect }) {
  const options = ["male", "female"];

  const [selectedOption, setSelectedOption] = useState();

  const handleValueChange = (value) => {
    setSelectedOption(value);
    if (onUserSelect) {
      onUserSelect("gender", value);
    }
  };

  return (
    <div className="mt-5">
      <h2 className="font-normal text-xl text-primary">Gender</h2>
      <p className="text-gray-500">
        What will be the gender of voice for the video?
      </p>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full mt-2 text-lg">
          <SelectValue placeholder="Select Gender" />
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

export default SelectGender;
