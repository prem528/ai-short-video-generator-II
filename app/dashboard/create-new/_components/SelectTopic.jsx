"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function SelectTopic({ onUserSelect }) {
  const options = [
    "Custom Prompt",
    "Product Description",
    "Product Advertisement",
    "Product Review",
    "Story Telling",
  ];

  const [selectedOption, setSelectedOption] = useState();

  const handleValueChange = (value) => {
    setSelectedOption(value);
    if (value !== "Custom Prompt") {
      onUserSelect("topic", value);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground">Content type</label>
      <p className="mt-1 text-xs text-muted-foreground">
        Sets the tone and structure of the script.
      </p>
      <Select onValueChange={handleValueChange} value={selectedOption}>
        <SelectTrigger className="mt-2 w-full">
          <SelectValue placeholder="Select a content type" />
        </SelectTrigger>
        <SelectContent>
          {options.map((item, index) => {
            return (
              <SelectItem key={index} value={item}>
                {item}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedOption === "Custom Prompt" && (
        <Textarea
          className="mt-3 resize-none"
          rows={3}
          onChange={(e) => onUserSelect("topic", e.target.value)}
          placeholder="Describe exactly what the video should say…"
        />
      )}
    </div>
  );
}

export default SelectTopic;
