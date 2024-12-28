"use server";

import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

// function to set role on database & clerk:
export async function setRole(formData) {
  const client = await clerkClient();
  const role = formData.get("role");
  const userId = formData.get("id");

  try {
    // Fetch the user from Clerk to get the primary email address
    const user = await client.users.getUser(userId);
    const primaryEmailAddress = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!primaryEmailAddress) {
      throw new Error("Primary email address not found.");
    }

    // Update the role in Clerk
    const res = await client.users.updateUser(userId, {
      publicMetadata: { role: role },
    });

    // Update the role in Neon database using Drizzle ORM
    await db
      .update(Users)
      .set({ role: role })
      .where(eq(Users.email, primaryEmailAddress)); // Match the primary email address in Neon DB

    return { message: res.publicMetadata };
  } catch (err) {
    console.error("Error updating role:", err);
    return { message: err.message || "An error occurred" };
  }
}
