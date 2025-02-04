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
    <div className="mt-5 mb-5">
      <h2 className="font-noraml text-xl text-primary">Product Description</h2>
      <Textarea
        ref={textareaRef}
        className="mt-3 resize-none"
        value={description}
        onChange={handleChange}
        placeholder="Description"
        rows={5}
      />
    </div>
  );
}

export default ProductDescription;
