"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectLanguage({ onUserSelect }) {
  // Only languages our local TTS can speak — see lib/tts/profiles.js.
  // The other Indic languages need a separate engine (docs/VOICEBOX_INTEGRATION.md §9).
  const options = ["English", "Hindi"];

  const [selectedOption, setSelectedOption] = useState();

  const handleValueChange = (value) => {
    setSelectedOption(value);
    if (onUserSelect) {
      onUserSelect("language", value);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground">Language</label>
      <p className="mt-1 text-xs text-muted-foreground">Spoken language.</p>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="mt-2 w-full">
          <SelectValue placeholder="Select language" />
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

export default SelectLanguage;
