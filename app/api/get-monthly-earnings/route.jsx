import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function GET() {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  try {
    // Get payments from the last 12 months
    const now = new Date();
    const firstDayOfLastYear = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      1
    ).getTime();

    const payments = await razorpay.payments.all({
      from: Math.floor(firstDayOfLastYear / 1000), // Start of last year
      to: Math.floor(now.getTime() / 1000), // Current time
    });

    // Process payments to calculate revenue by month
    const monthlyEarnings = payments.items.reduce((acc, payment) => {
      if (payment.status === "captured") {
        const date = new Date(payment.created_at * 1000); // Convert Unix timestamp to Date
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear();

        const key = `${month} ${year}`;
        if (!acc[key]) {
          acc[key] = 0;
        }

        acc[key] += payment.amount / 100; // Convert to main currency unit
      }

      //   console.log("Acc :", acc);

      return acc;
    }, {});

    // Format data for the chart
    const formattedData = Object.entries(monthlyEarnings).map(
      ([month, earnings]) => ({
        month,
        earnings,
      })
    );

    // console.log("formattedData :", formattedData);

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch monthly data." },
      { status: 500 }
    );
  }
}
