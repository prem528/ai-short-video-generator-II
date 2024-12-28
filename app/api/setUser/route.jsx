import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId, email, fullName, imageUrl } = await req.json();

  try {
    // Check if user exists in Neon
    const result = await db.select().from(Users).where(eq(Users.email, email));

    // If the user is new, insert them into Neon with the default role
    if (!result[0]) {
      await db.insert(Users).values({
        name: fullName,
        email,
        imageUrl,
        role: "user", // Default role
      });

      // Set the role in Clerk
      const client = await clerkClient();

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "user", // Default role in Clerk
        },
      });
    }

    return new NextResponse(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Error setting role:", error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
