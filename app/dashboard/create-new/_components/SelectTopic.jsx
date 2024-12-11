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
    <div className="mt-5">
      <h2 className="font-bold text-2xl text-primary">Content</h2>
      <p className="text-gray-500">What is the title of the video?</p>
      <Select onValueChange={handleValueChange} value={selectedOption}>
        <SelectTrigger className="w-full mt-2 text-lg">
          <SelectValue placeholder="Content Type" />
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
          className="mt-3"
          onChange={(e) => onUserSelect("topic", e.target.value)}
          placeholder="Enter your prompt"
        />
      )}
    </div>
  );
}

export default SelectTopic;
