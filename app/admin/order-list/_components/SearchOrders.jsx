"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RefreshCcw } from "lucide-react";

export const SearchOrders = ({ onSearch, onReload }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleReload = () => {
    onReload();
    setSearchTerm("");
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <div className="flex items-center gap-3 justify-center">
        <Label htmlFor="search" className="text-lg font-medium text-gray-700">
          Search for Orders
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="search"
            name="search"
            type="text"
            placeholder="Enter order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" className="bg-primary text-white">
            Search
          </Button>
          <Button
            type="button"
            onClick={handleReload}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600"
          >
            <RefreshCcw size={20} />
          </Button>
        </div>
      </div>
    </form>
  );
};
