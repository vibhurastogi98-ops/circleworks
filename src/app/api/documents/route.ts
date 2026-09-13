import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { employeeDocuments, employees } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const BUCKET = "employee-documents";
const MAX_BYTES = 25 * 1024 * 1024; // 25MB

async function requireContext(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const context = await resolveUserContext(session);
  if (!context?.employeeId) return { error: NextResponse.json({ error: "no_employee_row" }, { status: 404 }) };
  return { session, context };
}

/**
 * Best-effort bucket creation on first use so devs don't need to click into
 * the Supabase dashboard. Idempotent; ignores "already exists" errors.
 */
async function ensureBucket() {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false as const, reason: "supabase_admin_not_configured" };
  const { data: list } = await admin.storage.listBuckets();
  if (!list?.some((b) => b.name === BUCKET)) {
    const { error } = await admin.storage.createBucket(BUCKET, { public: false });
    // "already exists" comes back racy — treat as success.
    if (error && !/already.*exist/i.test(error.message)) {
      return { ok: false as const, reason: `bucket_create_failed: ${error.message}` };
    }
  }
  return { ok: true as const, admin };
}

async function signedUrlFor(objectPath: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin.storage.from(BUCKET).createSignedUrl(objectPath, 60 * 10);
  return data?.signedUrl ?? null;
}

/**
 * fileUrl in the DB can be:
 *   - "sb://employee-documents/<path>"   — object we uploaded to Supabase Storage
 *   - anything else                      — treat as an external link
 * For the first form we mint a fresh signed URL on read; the second is returned as-is.
 */
async function resolveDownloadUrl(fileUrl: string | null): Promise<string | null> {
  if (!fileUrl) return null;
  const prefix = `sb://${BUCKET}/`;
  if (fileUrl.startsWith(prefix)) {
    const objectPath = fileUrl.slice(prefix.length);
    return signedUrlFor(objectPath);
  }
  return fileUrl;
}

export async function GET(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const rows = await db
    .select({
      id: employeeDocuments.id,
      name: employeeDocuments.name,
      type: employeeDocuments.type,
      fileUrl: employeeDocuments.fileUrl,
      status: employeeDocuments.status,
      createdAt: employeeDocuments.createdAt,
    })
    .from(employeeDocuments)
    .where(eq(employeeDocuments.employeeId, context.employeeId))
    .orderBy(desc(employeeDocuments.createdAt))
    .limit(200);

  const documents = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      downloadUrl: await resolveDownloadUrl(r.fileUrl),
    })),
  );

  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const contentType = request.headers.get("content-type") ?? "";

  // ── Path A: multipart upload — real file lands in Supabase Storage ────────
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const name = String(form.get("name") ?? "").trim();
    const type = String(form.get("type") ?? "Other").trim() || "Other";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "file_too_large", maxBytes: MAX_BYTES }, { status: 413 });
    }
    const displayName = name || file.name || "Untitled";

    const bucket = await ensureBucket();
    if (!bucket.ok) {
      return NextResponse.json({ error: bucket.reason }, { status: 500 });
    }

    // Namespace path by companyId + employeeId to keep tenant boundaries clean.
    const [emp] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .where(eq(employees.id, context.employeeId))
      .limit(1);
    const companyId = emp?.companyId ?? 0;
    const safeName = (file.name || "upload").replace(/[^\w.\-]+/g, "_");
    const objectPath = `${companyId}/${context.employeeId}/${Date.now()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await bucket.admin.storage
      .from(BUCKET)
      .upload(objectPath, new Uint8Array(arrayBuffer), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadErr) {
      return NextResponse.json({ error: `upload_failed: ${uploadErr.message}` }, { status: 500 });
    }

    const [row] = await db
      .insert(employeeDocuments)
      .values({
        employeeId: context.employeeId,
        name: displayName,
        type,
        fileUrl: `sb://${BUCKET}/${objectPath}`,
        status: "Ready",
      })
      .returning();
    return NextResponse.json({
      ok: true,
      document: { ...row, downloadUrl: await signedUrlFor(objectPath) },
    });
  }

  // ── Path B: JSON metadata (link to external file, or placeholder) ────────
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" && body.type.trim() ? body.type.trim() : "Other";
  const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl.trim() : null;
  const status = typeof body.status === "string" ? body.status.trim() : "Ready";
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

  const [row] = await db
    .insert(employeeDocuments)
    .values({ employeeId: context.employeeId, name, type, fileUrl, status })
    .returning();
  return NextResponse.json({
    ok: true,
    document: { ...row, downloadUrl: await resolveDownloadUrl(fileUrl) },
  });
}

export async function DELETE(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [row] = await db
    .select({ id: employeeDocuments.id, fileUrl: employeeDocuments.fileUrl })
    .from(employeeDocuments)
    .where(and(eq(employeeDocuments.id, id), eq(employeeDocuments.employeeId, context.employeeId)))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  await db.delete(employeeDocuments).where(eq(employeeDocuments.id, id));

  // Best-effort delete of the Storage object; failures don't block the row delete.
  const prefix = `sb://${BUCKET}/`;
  if (row.fileUrl?.startsWith(prefix)) {
    const admin = getSupabaseAdmin();
    if (admin) {
      await admin.storage.from(BUCKET).remove([row.fileUrl.slice(prefix.length)]).catch(() => undefined);
    }
  }
  return NextResponse.json({ ok: true });
}
