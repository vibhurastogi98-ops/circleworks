import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function PATCH(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const client = await clerkClient();

    // 1. Update Clerk Metadata if relevant fields are present
    const metadataToUpdate: Record<string, any> = {};
    if (typeof body.hasCompletedTour === "boolean") {
      metadataToUpdate.hasCompletedTour = body.hasCompletedTour;
    }
    if (typeof body.companyName === "string") {
      metadataToUpdate.companyName = body.companyName;
    }

    if (Object.keys(metadataToUpdate).length > 0) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: metadataToUpdate
      });
    }

    // 2. Sync with Backend Database (Worker API)
    const token = await getToken();
    try {
      await fetch("https://circleworks-worker.vibhurastogi98.workers.dev/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
    } catch (err) {
      console.error("Failed to sync profile fields to backend DB", err);
      // non-blocking
    }

    return NextResponse.json({ success: true, updatedFields: Object.keys(body) });
  } catch (error) {
    console.error("[USERS_ME_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
