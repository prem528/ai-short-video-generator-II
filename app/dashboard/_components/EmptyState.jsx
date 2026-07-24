import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clapperboard, Plus } from "lucide-react";
import React from "react";

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-brand-2/15">
        <Clapperboard className="h-7 w-7 text-brand" />
      </span>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Your reel is empty
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Turn a prompt into a captioned vertical short in about a minute. Your
        first render starts here.
      </p>
      <Link href={"dashboard/create-new"} className="mt-6">
        <Button className="bg-brand text-brand-foreground shadow-sm hover:bg-brand/90">
          <Plus className="mr-2 h-4 w-4" />
          Create your first short
        </Button>
      </Link>
    </div>
  );
}

export default EmptyState;
