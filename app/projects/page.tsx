import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/SiteFooter";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Projects — Amanda Juvera" };

// Projects are editable from /admin, so don't bake them into a static build.
export const dynamic = "force-dynamic";

function formatRelative(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <Masthead current="/projects" label="Projects" />

      <main className="page">
        <p className="page__eyebrow utility">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="1.5" />
            <path d="M6 9l3 3-3 3" />
            <path d="M11 15h6" />
          </svg>
          Selected work
        </p>
        <h1 className="page__title">Projects</h1>

        {projects.length === 0 ? (
          <p className="prose">
            No projects published yet. Add one from the admin dashboard.
          </p>
        ) : (
          <ol className="work">
            {projects.map((project, index) => (
              <li className="work__item" key={project.id}>
                <span className="work__folio">
                  No. {String(index + 1).padStart(2, "0")}
                </span>
                <div className="work__body">
                  <h2 className="work__title">{project.title}</h2>
                  <p className="utility" style={{ marginBottom: "0.9rem" }}>
                    {project.techLine}
                  </p>

                  {project.description.split("\n\n").map((para) => (
                    <p key={para.slice(0, 40)}>{para}</p>
                  ))}

                  {project.ghSyncedAt ? (
                    <p className="repo-stats utility">
                      {project.ghLanguage ? <span>{project.ghLanguage}</span> : null}
                      <span>
                        {project.ghStars ?? 0} star
                        {project.ghStars === 1 ? "" : "s"}
                      </span>
                      {project.ghPushedAt ? (
                        <span>updated {formatRelative(project.ghPushedAt)}</span>
                      ) : null}
                    </p>
                  ) : null}

                  {project.repoUrl || project.liveUrl ? (
                    <div className="work__meta">
                      {project.repoUrl ? (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Source
                        </a>
                      ) : null}
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
