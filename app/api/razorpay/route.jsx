import Razorpay from "razorpay";
import shortid from "shortid";

export async function POST(req) {
  // Parse the request body (if needed)
  const body = await req.json();

  // Initialize Razorpay instance
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  const payment_capture = 1;
  const amount = body.amount * 100; // Convert amount from paise to rupee
  const currency = "INR";

  const options = {
    amount: amount.toString(),
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    return new Response(
      JSON.stringify({
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Razorpay Order Creation Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create Razorpay order." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
