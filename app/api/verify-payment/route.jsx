import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  try {
    // Read the request body as JSON
    const { paymentId, orderId, razorpaySignature } = await req.json();

    console.log(req.json);

    console.log("paymentId:", paymentId);
    console.log("orderId:", orderId);
    console.log("razorpaySignature:", razorpaySignature);

    if (!paymentId || !orderId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    // Fetch the payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    // Check if the payment status is 'captured' and verify the order ID
    if (payment.status === "captured" && payment.order_id === orderId) {
      // Payment was successful
      return NextResponse.json(
        {
          success: true,
          message: "Payment verified successfully.",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed or payment not captured.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
