"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

function CustomLoading({ loading }) {
  return (
    <div>
      <AlertDialog open={loading}>
        <AlertDialogContent className="bg-white">
          <AlertDialogTitle className="flex flex-col items-center justify-center">
            Loading...
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Please wait while we perform the operation.
          </AlertDialogDescription>
          <div className="bg-white flex flex-col items-center my-10 justify-center">
            <Image src="/loading3.gif" alt="loading" height={100} width={300} style={{ width: "auto", height: "auto" }} />
            <h2>Please do not refresh the browser.</h2>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CustomLoading;
