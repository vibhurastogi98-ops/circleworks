import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  let evt: any;

  try {
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as any;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const primaryEmail = email_addresses?.[0]?.email_address;
    if (!primaryEmail) {
      console.error("No email found for user:", id);
      return NextResponse.json({ error: "No email provided" }, { status: 400 });
    }

    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, id))
        .limit(1);

      if (existingUser.length > 0) {
        console.log("User already exists:", id);
        return NextResponse.json({ message: "User already exists" });
      }

      // Create new user
      await db.insert(users).values({
        clerkUserId: id,
        email: primaryEmail,
        role: "employee", // Default role
      });

      console.log("User created:", id, primaryEmail);
      return NextResponse.json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
  }

  // Handle other events if needed
  console.log("Unhandled webhook event:", eventType);
  return NextResponse.json({ message: "Event received" });
}