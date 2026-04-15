import { db } from "@/db";
import { agencyProjects, agencyClients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const projects = await db
      .select({
        id: agencyProjects.id,
        name: agencyProjects.name,
        description: agencyProjects.description,
        budget: agencyProjects.budget,
        startDate: agencyProjects.startDate,
        endDate: agencyProjects.endDate,
        status: agencyProjects.status,
        companyId: agencyProjects.companyId,
        clientId: agencyProjects.clientId,
        createdAt: agencyProjects.createdAt,
        client: {
          id: agencyClients.id,
          name: agencyClients.name,
          logoUrl: agencyClients.logoUrl
        }
      })
      .from(agencyProjects)
      .leftJoin(agencyClients, eq(agencyProjects.clientId, agencyClients.id))
      .orderBy(desc(agencyProjects.createdAt));

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching agency projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      clientId, 
      status, 
      companyId,
      description,
      budget,
      startDate,
      endDate
    } = body;

    if (!name || !clientId || !companyId) {
      return NextResponse.json(
        { success: false, error: "Project Name, Client ID, and Company ID are required" },
        { status: 400 }
      );
    }

    const [newProject] = await db
      .insert(agencyProjects)
      .values({
        name,
        clientId: Number(clientId),
        status,
        companyId: Number(companyId),
        description,
        budget: budget ? Number(budget) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      .returning();

    return NextResponse.json({
      success: true,
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating agency project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
