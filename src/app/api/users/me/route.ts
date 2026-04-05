import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function PATCH(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Check if body has hasCompletedTour
    if (typeof body.hasCompletedTour === "boolean") {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          hasCompletedTour: body.hasCompletedTour
        }
      });
      
      // Also connect to database backend (Worker API)
      const token = await getToken();
      try {
        await fetch("https://circleworks-worker.vibhurastogi98.workers.dev/users/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ hasCompletedTour: body.hasCompletedTour })
        });
      } catch (err) {
        console.error("Failed to sync tour completion stat to backend DB", err);
        // non-blocking
      }

      return NextResponse.json({ success: true, hasCompletedTour: body.hasCompletedTour });
    }

    // Pass any other PATCH fields identically to Backend DB
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
      console.error("Failed to sync profile stat to backend DB", err);
    }

    return NextResponse.json({ success: true, message: "Profile fields updated." });
  } catch (error) {
    console.error("[USERS_ME_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
