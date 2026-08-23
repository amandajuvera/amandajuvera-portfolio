import { z } from "zod";

export const ProjectInput = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  title: z.string().trim().min(1, "Title is required").max(150),
  techLine: z.string().trim().min(1, "Tech line is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(5000),
  repoUrl: z.string().trim().url("Enter a valid URL").max(300).optional().or(z.literal("")),
  liveUrl: z.string().trim().url("Enter a valid URL").max(300).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  published: z.coerce.boolean().default(true),
});

export type ProjectInput = z.infer<typeof ProjectInput>;

/** github.com/owner/repo -> { owner, repo }; anything else -> null. */
export function parseGitHubRepo(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/, "") };
  } catch {
    return null;
  }
}
