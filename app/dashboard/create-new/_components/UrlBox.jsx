"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

      if (response.ok && result.success !== false) {
        const fetchedData = {
          title: result.title || "",
          description: result.description || "",
          images: Array.isArray(result.images) ? result.images : [],
          video: result.video || null,
        };
        setData(fetchedData);
        onUserSelect(fetchedData);
      } else {
        setError(result.details || result.error || "Failed to fetch data.");
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
      <Label className="text-sm font-medium text-foreground" htmlFor="url">
        Product URL
      </Label>
      <div className="mt-2 flex w-full gap-2">
        <Input
          id="url"
          type="url"
          placeholder="https://example.com/product"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={fetchData}
          disabled={loading}
          className="shrink-0"
        >
          {loading ? "Fetching…" : "Autofill"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default UrlBox;
