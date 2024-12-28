"use client";

import React from "react";
import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const Account = () => {
  const { user, signOut } = useClerk();

  return (
    <div className="account p-5">
      <h1 className="text-2xl text-primary font-bold">Account</h1>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center border border-gray-300 shadow-sm hover:shadow-xl rounded-lg p-10 m-10 bg-white max-w-md mx-auto ">
          <img
            src={user.imageUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full mb-5"
          />
          <div className="account-details text-left">
            <p className="text-lg font-medium ">
              <strong className="text-primary">Name:</strong> {user.fullName}
            </p>
            <p className="text-lg font-medium ">
              <strong className="text-primary">Email:</strong>{" "}
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div className="flex flex-col space-y-3 mt-5">
            <Button
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
