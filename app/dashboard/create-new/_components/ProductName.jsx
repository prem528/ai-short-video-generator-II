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
    <div>
      <Label className="text-sm font-medium text-foreground" htmlFor="name">
        Product name
      </Label>
      <Input
        id="name"
        type="text"
        value={productName}
        onChange={handleChange}
        placeholder="e.g. Realme GT 7 Pro"
        className="mt-2"
      />
    </div>
  );
}

export default ProductName;
