import { NextResponse } from "next/server";
import redis from "@/lib/redis";

// GET: Load workspace state
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Missing email parameter" }, { status: 400 });
    }

    const stateStr = await redis.get(`workspace:${email}`);
    if (!stateStr) {
      return NextResponse.json({ state: null }, { status: 200 });
    }

    const state = JSON.parse(stateStr);
    return NextResponse.json({ state }, { status: 200 });
  } catch (error) {
    console.error("Redis get workspace error:", error);
    return NextResponse.json(
      { message: "Failed to retrieve cached state", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Save workspace state
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, state } = body;

    if (!email || !state) {
      return NextResponse.json({ message: "Missing email or state payload" }, { status: 400 });
    }

    // Cache state in Redis with a 7-day TTL (604800 seconds)
    await redis.set(`workspace:${email}`, JSON.stringify(state), "EX", 604800);

    return NextResponse.json({ message: "Workspace cached successfully" }, { status: 200 });
  } catch (error) {
    console.error("Redis set workspace error:", error);
    return NextResponse.json(
      { message: "Failed to cache workspace state", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Clear workspace state
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Missing email parameter" }, { status: 400 });
    }

    await redis.del(`workspace:${email}`);

    return NextResponse.json({ message: "Workspace cache cleared" }, { status: 200 });
  } catch (error) {
    console.error("Redis delete workspace error:", error);
    return NextResponse.json(
      { message: "Failed to clear workspace cache", details: error.message },
      { status: 500 }
    );
  }
}
