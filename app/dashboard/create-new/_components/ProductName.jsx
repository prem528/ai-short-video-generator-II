import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";

function ProductName({ value, onValueChange }) {
  const [productName, setProductName] = useState(value);

  // Update the state if the `value` prop changes (e.g., for autofill)
  useEffect(() => {
    setProductName(value);
  }, [value]);

  // Handle changes made by the user
  const handleChange = (e) => {
    const newValue = e.target.value;
    setProductName(newValue);
    onValueChange(newValue);
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl text-primary">Product Name</h2>
      <Input
        id="name"
        type="text"
        value={productName}
        onChange={handleChange}
        placeholder="Product Name"
        className="mt-3"
      />
    </div>
  );
}

export default ProductName;
