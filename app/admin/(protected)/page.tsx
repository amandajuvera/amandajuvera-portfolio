import Link from "next/link";
import { db } from "@/lib/db";
import { deleteProject } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [projects, unreadCount] = await Promise.all([
    db.project.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.message.count({ where: { read: false } }),
  ]);

  return (
    <>
      <div className="admin__head">
        <h1>Projects</h1>
        <Link className="btn" href="/admin/projects/new">
          New project
        </Link>
      </div>

      {unreadCount > 0 ? (
        <p className="admin__banner">
          You have {unreadCount} unread message{unreadCount === 1 ? "" : "s"}.{" "}
          <Link href="/admin/messages">Read them</Link>
        </p>
      ) : null}

      {projects.length === 0 ? (
        <p className="admin__empty">No projects yet. Create your first one.</p>
      ) : (
        <table className="admin__table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Title</th>
              <th>Slug</th>
              <th>GitHub</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.sortOrder}</td>
                <td>
                  <Link href={`/admin/projects/${p.id}`}>{p.title}</Link>
                </td>
                <td>
                  <code>{p.slug}</code>
                </td>
                <td>
                  {p.ghSyncedAt
                    ? `${p.ghStars ?? 0}★ ${p.ghLanguage ?? ""}`.trim()
                    : p.repoUrl
                      ? "not synced"
                      : "—"}
                </td>
                <td>{p.published ? "Published" : "Draft"}</td>
                <td className="admin__row-actions">
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="admin__danger">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
