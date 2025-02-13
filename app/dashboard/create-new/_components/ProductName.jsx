import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Label className="font-normal text-xl text-primary" htmlFor="productName">
        Product Name
      </Label>
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
