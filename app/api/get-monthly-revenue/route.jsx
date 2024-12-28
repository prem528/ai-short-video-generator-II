import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function GET() {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  try {
    // Get the first and last day of the current month in Unix timestamp (milliseconds)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const lastDay = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getTime();

    // Fetch payments for the current month
    const payments = await razorpay.payments.all({
      from: Math.floor(firstDay / 1000), // Convert to seconds
      to: Math.floor(lastDay / 1000), // Convert to seconds
    });

    // Calculate total revenue
    const totalRevenue = payments.items.reduce((sum, payment) => {
      if (payment.status === "captured") {
        return sum + payment.amount; // Amount is in the smallest currency unit
      }
      return sum;
    }, 0);

    // Return total revenue in the main currency unit
    return NextResponse.json({
      success: true,
      revenue: totalRevenue / 100, // Convert to main currency unit
    });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch monthly revenue." },
      { status: 500 }
    );
  }
}
