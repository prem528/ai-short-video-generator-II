import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

function ProductDescription({ value, onValueChange }) {
  const [description, setDescription] = useState(value);
  const textareaRef = useRef(null);

  // Adjust textarea height based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to calculate new height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
    }
  };

  // Update state and adjust height when the value prop changes
  useEffect(() => {
    setDescription(value || ""); // Ensure no null/undefined values
    adjustTextareaHeight();
  }, [value]);

  // Handle manual input changes
  const handleChange = (e) => {
    const newValue = e.target.value;
    setDescription(newValue);
    onValueChange(newValue);
    adjustTextareaHeight(); // Adjust height dynamically on user input
  };

  return (
    <div>
      <label
        htmlFor="description"
        className="text-sm font-medium text-foreground"
      >
        Product description
      </label>
      <Textarea
        id="description"
        ref={textareaRef}
        className="mt-2 resize-none"
        value={description}
        onChange={handleChange}
        placeholder="What is it, who is it for, and what makes it stand out?"
        rows={4}
      />
    </div>
  );
}

export default ProductDescription;
