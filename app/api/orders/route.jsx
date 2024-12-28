import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function GET(request) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search"); // Get search query (order ID)

    let orders = [];

    if (search) {
      // If there's a search term, search for the order by order ID
      const order = await razorpay.orders.fetch(search);
      if (order) {
        orders = [order];
      }
    } else {
      // If no search term, fetch all orders (or a list of orders, based on your criteria)
      const response = await razorpay.orders.all();
      orders = response.items || [];
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message });
  }
}
