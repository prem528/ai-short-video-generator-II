"use client";

import React, { useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { CoinCard } from "./_components/CoinCard";
import { useToast } from "@/hooks/use-toast";
import { UserDetailContext } from "@/app/_context/userDataContext";
import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";

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
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="h-9 w-[3px] rounded-full bg-gradient-to-b from-brand to-brand-2" />
          <div>
            <span className="timecode text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Billing
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Add Credits
            </h2>
          </div>
        </div>
      </div>

      {/* Current Balance Summary Card */}
      <div className="mb-8 p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Your Balance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Use credits to generate scripts, scenes, and videos.</p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/30 border border-border/50 px-4 py-2.5 rounded-xl">
          <Image src="/coin.png" alt="coin" height={22} width={22} />
          <span className="timecode text-lg font-bold text-foreground">{userData?.credits ?? 0} Credits</span>
        </div>
      </div>

      {/* Coin Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
  );
}

export default Page;
