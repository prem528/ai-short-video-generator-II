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
    <div>
      <label className="text-sm font-medium text-foreground">Duration</label>
      <p className="mt-1 text-xs text-muted-foreground">Target video length.</p>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="mt-2 w-full">
          <SelectValue placeholder="Select duration" />
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
