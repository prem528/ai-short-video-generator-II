"use server";

import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

// Function to delete a user from both Clerk and Neon database
export async function deleteUser(formData) {
  const client = await clerkClient();
  const userId = formData.get("userId");

  try {
    // Fetch the user from Clerk to get the primary email address
    const user = await client.users.getUser(userId);
    const primaryEmailAddress = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!primaryEmailAddress) {
      throw new Error("Primary email address not found.");
    }

    // Delete the user from Clerk
    await client.users.deleteUser(userId);

    // Delete the user from the Neon database
    await db.delete(Users).where(eq(Users.email, primaryEmailAddress));

    return { message: "User deleted successfully" };
  } catch (err) {
    console.error("Error deleting user:", err);
    return { message: err.message || "An error occurred" };
  }
}
