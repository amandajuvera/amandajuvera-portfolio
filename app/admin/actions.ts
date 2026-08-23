"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ProjectInput } from "@/lib/projects";

/**
 * Server actions are publicly callable endpoints, not just internal functions —
 * every one of them has to re-check the session rather than trusting that the
 * caller came from a page that already did.
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
}

export type ActionState = { error?: string; fieldErrors?: Record<string, string[]> };

function readForm(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    techLine: String(formData.get("techLine") ?? ""),
    description: String(formData.get("description") ?? ""),
    repoUrl: String(formData.get("repoUrl") ?? ""),
    liveUrl: String(formData.get("liveUrl") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    published: formData.get("published") === "on",
  };
}

export async function saveProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = ProjectInput.safeParse(readForm(formData));

  if (!parsed.success) {
    return { error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { repoUrl, liveUrl, ...rest } = parsed.data;
  const data = {
    ...rest,
    repoUrl: repoUrl || null,
    liveUrl: liveUrl || null,
  };

  try {
    if (id) {
      await db.project.update({ where: { id }, data });
    } else {
      await db.project.create({ data });
    }
  } catch (error) {
    // Unique constraint on slug is the realistic failure here.
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "That slug is already used by another project." };
    }
    throw error;
  }

  revalidatePath("/projects");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.project.delete({ where: { id } });
  revalidatePath("/projects");
  revalidatePath("/admin");
}

export async function markMessageRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.message.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.message.delete({ where: { id } });
  revalidatePath("/admin/messages");
}
