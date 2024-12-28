"use client";

import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCcw } from "lucide-react";

export const SearchUsers = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Function to handle the reload button click and refresh the search results
  const handleReload = () => {
    router.replace(pathname);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const queryTerm = formData.get("search");
          router.push(pathname + "?search=" + queryTerm);
        }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 justify-center">
          <Label
            htmlFor="search"
            className="text-lg font-semibold text-gray-700"
          >
            Search
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="search"
              name="search"
              type="text"
              placeholder="Enter user name or email"
              className="flex-grow"
            />
            <Button type="submit" className="bg-primary text-white">
              Submit
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
    </div>
  );
};
