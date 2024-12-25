"use client";

import React, { useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { CoinCard } from "./_components/CoinCard";
import { useToast } from "@/hooks/use-toast";
import { UserDetailContext } from "@/app/_context/userDataContext";
import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";

function Page() {
  const { user } = useUser(); // Fetch user details from Clerk
  const { toast } = useToast();
  const { userData, setUserData } = useContext(UserDetailContext);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      if (
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        )
      ) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const makePayment = async (price) => {
    const res = await initializeRazorpay();

    if (!res) {
      toast({ title: "Error", description: "Failed to load Razorpay SDK." });
      return;
    }

    try {
      const userId = user?.id;
      if (!userId) throw new Error("User  not logged in.");

      // Create an order
      const data = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, userId }),
      }).then((t) => t.json());

      if (!data.id) throw new Error("Order creation failed.");

      // Configure Razorpay options
      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        currency: data.currency,
        amount: data.amount,
        order_id: data.id,
        description: "Coin purchase",
        handler: async (response) => {
          // Send payment details to your backend to verify the payment
          const verificationResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          }).then((res) => res.json());

          if (verificationResponse.success) {
            await updateUserCredits(price);
            toast({
              title: "Success",
              description: "Payment verified successfully.",
            });
          } else {
            toast({
              title: "Error",
              description: "Payment verification failed.",
            });
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
        },
      };

      // Open Razorpay modal
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
      });
    }
  };

  // Used to update user's credits:
  const updateUserCredits = async (price) => {
    const result = await db
      .update(Users)
      .set({ credits: userData?.credits + price })
      .where(eq(Users?.email, user?.primaryEmailAddress?.emailAddress));

    console.log("Credit Addition:", result);
    setUserData((prev) => ({
      ...prev,
      credits: userData?.credits + price,
    }));
  };

  return (
    <div className="md:px-20">
      <div className="mt-10 p-10 relative animate-shadow-pulse bg-white">
        <h1 className="font-bold text-4xl text-primary text-center">
          Add Credits
        </h1>
        <div className="m-20 flex items-center justify-center">
          <div className="flex flex-row justify-between gap-5 border-solid border-primary">
            <CoinCard
              title="Basic Pack"
              price="10"
              description="Adds 10 credits to your account!"
              onClick={() => makePayment(10)}
            />
            <CoinCard
              title="Value Pack"
              price="100"
              description="Adds 100 credits to your account!"
              onClick={() => makePayment(100)}
            />
            <CoinCard
              title="Ultimate Pack"
              price="1000"
              description="Adds 1000 credits to your account!"
              onClick={() => makePayment(1000)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
