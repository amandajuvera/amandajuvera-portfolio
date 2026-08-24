import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { parseGitHubRepo } from "@/lib/projects";

// Always hit GitHub fresh; this route is the thing that refreshes the cache.
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  // timingSafeEqual throws on length mismatch, so check that separately.
  return a.length === b.length && timingSafeEqual(a, b);
}

type RepoResponse = {
  stargazers_count?: number;
  forks_count?: number;
  language?: string | null;
  pushed_at?: string | null;
};

/**
 * Refreshes cached GitHub stats for every project with a github.com repo URL.
 * Public repo metadata needs no token, but an unauthenticated caller only gets
 * 60 requests/hour — set GITHUB_TOKEN to raise that to 5000.
 */
async function runSync(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.project.findMany({
    where: { repoUrl: { not: null } },
    select: { id: true, slug: true, repoUrl: true },
  });

  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "amandajuvera-portfolio-sync",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const synced: string[] = [];
  const skipped: { slug: string; reason: string }[] = [];

  for (const project of projects) {
    const parsed = parseGitHubRepo(project.repoUrl);
    if (!parsed) {
      skipped.push({ slug: project.slug, reason: "repoUrl is not a github.com repo" });
      continue;
    }

    try {
      const res = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
        { headers, cache: "no-store" },
      );

      if (!res.ok) {
        skipped.push({ slug: project.slug, reason: `GitHub returned ${res.status}` });
        continue;
      }

      const repo = (await res.json()) as RepoResponse;

      await db.project.update({
        where: { id: project.id },
        data: {
          ghStars: repo.stargazers_count ?? null,
          ghForks: repo.forks_count ?? null,
          ghLanguage: repo.language ?? null,
          ghPushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          ghSyncedAt: new Date(),
        },
      });

      synced.push(project.slug);
    } catch (error) {
      skipped.push({
        slug: project.slug,
        reason: error instanceof Error ? error.message : "fetch failed",
      });
    }
  }

  return NextResponse.json({ synced, skipped, total: projects.length });
}

// Vercel Cron invokes scheduled endpoints with GET, so that's the path the
// nightly job takes. POST is kept for triggering a sync by hand.
export const GET = runSync;
export const POST = runSync;
