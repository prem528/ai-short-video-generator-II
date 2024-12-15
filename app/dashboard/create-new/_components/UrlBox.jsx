"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function UrlBox({ onUserSelect }) {
  const [url, setUrl] = useState("");
  const [data, setData] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!url || !isValidUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scrape-site-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (response.ok) {
        const fetchedData = {
          title: result.title || "No title available",
          description: result.description || "No description available",
        };
        setData(fetchedData);
        onUserSelect(fetchedData);
      } else {
        setError(result.error || "Failed to fetch data.");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div>
      <h2 className="font-bold text-2xl text-primary">
        Enter the product link
      </h2>
      <div className="flex w-full gap-1 mt-3">
        <Input
          type="url"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={fetchData} disabled={loading}>
          {loading ? "Fetching..." : "Fetch data"}
        </Button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default UrlBox;
