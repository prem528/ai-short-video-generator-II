"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function CustomLoading({ loading }) {
  return (
    <div>
      <AlertDialog open={loading}>
        <AlertDialogContent className="bg-white">
        <AlertDialogTitle className="flex flex-col items-center justify-center">Generating video</AlertDialogTitle>
          <div className="bg-white flex flex-col items-center my-10 justify-center">
            <Image src="/progress.gif" alt="loading" height={100} width={100} />
            <h2>Please do not refresh the browser.</h2>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CustomLoading;
