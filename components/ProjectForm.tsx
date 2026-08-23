"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProject, type ActionState } from "@/app/admin/actions";

export type ProjectFormValues = {
  id?: string;
  slug?: string;
  title?: string;
  techLine?: string;
  description?: string;
  repoUrl?: string | null;
  liveUrl?: string | null;
  sortOrder?: number;
  published?: boolean;
};

export function ProjectForm({ project }: { project?: ProjectFormValues }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveProject,
    {},
  );

  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="admin__form">
      {project?.id ? <input type="hidden" name="id" value={project.id} /> : null}

      <label className="field">
        <span className="field__label utility">Title</span>
        <input name="title" defaultValue={project?.title ?? ""} required />
        {err("title") ? <span className="field__error">{err("title")}</span> : null}
      </label>

      <label className="field">
        <span className="field__label utility">Slug</span>
        <input
          name="slug"
          defaultValue={project?.slug ?? ""}
          placeholder="social-media-analytics-pipeline"
          required
        />
        {err("slug") ? <span className="field__error">{err("slug")}</span> : null}
      </label>

      <label className="field">
        <span className="field__label utility">Tech line</span>
        <input
          name="techLine"
          defaultValue={project?.techLine ?? ""}
          placeholder="Python, Notion API, GitHub Actions"
          required
        />
        {err("techLine") ? (
          <span className="field__error">{err("techLine")}</span>
        ) : null}
      </label>

      <label className="field">
        <span className="field__label utility">
          Description (blank line separates paragraphs)
        </span>
        <textarea
          name="description"
          rows={10}
          defaultValue={project?.description ?? ""}
          required
        />
        {err("description") ? (
          <span className="field__error">{err("description")}</span>
        ) : null}
      </label>

      <label className="field">
        <span className="field__label utility">Repo URL</span>
        <input
          name="repoUrl"
          defaultValue={project?.repoUrl ?? ""}
          placeholder="https://github.com/amandajuvera/example"
        />
        {err("repoUrl") ? (
          <span className="field__error">{err("repoUrl")}</span>
        ) : null}
      </label>

      <label className="field">
        <span className="field__label utility">Live URL</span>
        <input name="liveUrl" defaultValue={project?.liveUrl ?? ""} />
        {err("liveUrl") ? (
          <span className="field__error">{err("liveUrl")}</span>
        ) : null}
      </label>

      <label className="field field--inline">
        <span className="field__label utility">Sort order</span>
        <input
          name="sortOrder"
          type="number"
          min={0}
          max={999}
          defaultValue={project?.sortOrder ?? 0}
        />
      </label>

      <label className="field field--check">
        <input
          name="published"
          type="checkbox"
          defaultChecked={project?.published ?? true}
        />
        <span>Published</span>
      </label>

      {state.error ? (
        <p className="form-note form-note--error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="admin__form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save project"}
        </button>
        <Link className="btn btn--ghost" href="/admin">
          Cancel
        </Link>
      </div>
    </form>
  );
}
