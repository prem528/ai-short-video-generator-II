import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function EmptyState() {
  return (
    <div className="flex items-center flex-col mt-10 border-2 boder-dashed p-5 py-24">
      <h2>You don't have any short video created</h2>
      <Link href={"dashboard/create-new"}>
        <Button>Create New Video</Button>
      </Link>
    </div>
  );
}

export default EmptyState;
