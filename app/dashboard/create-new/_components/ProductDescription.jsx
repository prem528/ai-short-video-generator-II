import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

function ProductDescription({ value, onValueChange }) {
  const [description, setDescription] = useState(value);

  // Update the state if the `value` prop changes (e.g., for autofill)
  useEffect(() => {
    setDescription(value);
  }, [value]);

  // Handle changes made by the user
  const handleChange = (e) => {
    const newValue = e.target.value;
    setDescription(newValue);
    onValueChange(newValue);
  };

  return (
    <div>
      <h2>Product Description</h2>
      <Textarea
        className="mt-3"
        value={description}
        onChange={handleChange}
        placeholder="Description"
      />
    </div>
  );
}

export default ProductDescription;
