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
    <div>
      <h2>Product Name</h2>
      <Input id="name" type="text" value={productName} onChange={handleChange} placeholder="Product Name"/>
    </div>
  );
}

export default ProductName;
