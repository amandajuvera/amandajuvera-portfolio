import { db } from "./db";
import { EDUCATION, EXPERIENCE, LINKS, PROJECTS, SKILLS, type ProjectSeed } from "./resume";

export type Node = {
  name: string;
  kind: "dir" | "file";
  /** Marks a node that opens an interactive panel rather than showing text. */
  action?: "compose";
  /** Bytes for files, child count for dirs — rendered in the size column. */
  size: number;
  modified: string;
  /** Where clicking navigates. Absent for leaf files that only display. */
  path?: string;
  /** Plain-text payload shown when a file is opened. */
  body?: string;
  /** Renders the opened file as a link out rather than as text. */
  href?: string;
  children?: Node[];
};

const MODE_DIR = "drwxr-xr-x";
const MODE_FILE = "-rw-r--r--";

export const mode = (n: Node) => (n.kind === "dir" ? MODE_DIR : MODE_FILE);

function file(name: string, body: string, modified: string): Node {
  return {
    name,
    kind: "file",
    size: Buffer.byteLength(body, "utf8"),
    modified,
    body,
  };
}

function link(name: string, body: string, href: string, modified: string): Node {
  return { ...file(name, body, modified), href };
}

function dir(name: string, path: string, children: Node[], modified: string): Node {
  return { name, kind: "dir", size: children.length, modified, path, children };
}

const BUILD_DATE = "2026-08-31";

/** Wraps prose at `width` so the mono reader doesn't run long lines off-screen. */
function wrap(text: string, width = 76): string {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    if (para.length <= width) {
      out.push(para);
      continue;
    }
    let line = "";
    for (const word of para.split(" ")) {
      if (line && line.length + word.length + 1 > width) {
        out.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) out.push(line);
  }
  return out.join("\n");
}

/** A role rendered as its own file: header block, then the bullets. */
function roleFile(role: (typeof EXPERIENCE)[number]): Node {
  const body = [
    role.title,
    `${role.org} · ${role.location}`,
    role.dates,
    "",
    ...role.bullets.flatMap((b) => [wrap(`- ${b}`), ""]),
  ]
    .join("\n")
    .trimEnd();

  return file(`${role.slug}.txt`, body, BUILD_DATE);
}

/** Turns one project row into a directory of readable files. */
function projectNode(p: {
  slug: string;
  title: string;
  techLine: string;
  description: string;
  repoUrl: string | null;
  liveUrl?: string | null;
  ghLanguage?: string | null;
  ghStars?: number | null;
  ghForks?: number | null;
  ghPushedAt?: Date | null;
  ghSyncedAt?: Date | null;
  updatedAt?: Date;
}): Node {
  const stamp = (p.ghPushedAt ?? p.updatedAt)?.toISOString().slice(0, 10) ?? BUILD_DATE;
  const paragraphs = p.description.split("\n\n").map((s) => s.trim()).filter(Boolean);

  /*
   * A project written as several "Component — description" paragraphs is
   * really several projects sharing a home. Split those into their own
   * directories so they can be browsed separately, and leave prose projects
   * as a single README.
   */
  const components = paragraphs
    .map((para) => para.match(/^(.{2,44}?)\s+—\s+([\s\S]+)$/))
    .filter((m): m is RegExpMatchArray => Boolean(m));

  const isComponentised = components.length === paragraphs.length && components.length > 1;

  const children: Node[] = isComponentised
    ? components.map(([, title, bodyText]) =>
        dir(
          title!.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          `/projects/${p.slug}`,
          [file("README.txt", wrap(`${title!.trim()}\n\n${bodyText!.trim()}`), stamp)],
          stamp,
        ),
      )
    : [file("README.txt", wrap(`${p.title}\n\n${p.description}`), stamp)];

  children.push(file("stack.txt", p.techLine.split(", ").join("\n"), stamp));

  if (p.ghSyncedAt) {
    children.push(
      file(
        "repo.json",
        JSON.stringify(
          {
            language: p.ghLanguage,
            stars: p.ghStars,
            forks: p.ghForks,
            pushed_at: p.ghPushedAt,
            synced_at: p.ghSyncedAt,
          },
          null,
          2,
        ),
        stamp,
      ),
    );
  }

  if (p.repoUrl) children.push(link("source.url", p.repoUrl, p.repoUrl, stamp));
  if (p.liveUrl) children.push(link("live.url", p.liveUrl, p.liveUrl, stamp));

  return dir(p.slug, `/projects/${p.slug}`, children, stamp);
}

/**
 * The site as a filesystem. Project entries come from the database so they can
 * be edited from /admin without a redeploy, and their timestamps are the real
 * `pushed_at` values cached by the GitHub sync — so the listing ages on its own
 * rather than showing invented dates.
 */
export async function buildTree(): Promise<Node[]> {
  /*
   * about, resume and contact are static, so a database that is down or
   * unconfigured should cost the visitor the live project rows and nothing
   * else. Letting this throw took the whole front page with it.
   */
  let rows: Awaited<ReturnType<typeof db.project.findMany>> = [];
  try {
    rows = await db.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  } catch (err) {
    console.error("buildTree: project listing unavailable", err);
  }

  /*
   * Fall back to the checked-in resume when the database has nothing to give.
   * The CMS is an editing convenience, not the only copy of the work — the
   * site should never present itself as having no projects.
   */
  const projectNodes: Node[] =
    rows.length > 0
      ? rows.map(projectNode)
      : PROJECTS.map((p: ProjectSeed) => projectNode({ ...p, ghPushedAt: null }));

  return [
    dir(
      "about",
      "/about",
      [
        file(
          "bio.txt",
          wrap(
            [
              "Hey, I'm Amanda. I'm studying Computer Science at the University of Michigan, graduating 2027.",
              "",
              "I have lived in California, New Jersey, Texas, Georgia, and Arizona.",
            ].join("\n"),
          ),
          BUILD_DATE,
        ),
        file("interests.txt", ["read", "draw", "weight-lift", "hike", "travel"].join("\n"), BUILD_DATE),
        file("location.txt", "Ann Arbor, Michigan", BUILD_DATE),
        dir(
          "links",
          "/about/links",
          [
            link("email.txt", LINKS.email, `mailto:${LINKS.email}`, BUILD_DATE),
            link("github.url", LINKS.github, LINKS.github, BUILD_DATE),
            link("linkedin.url", LINKS.linkedin, LINKS.linkedin, BUILD_DATE),
          ],
          BUILD_DATE,
        ),
      ],
      BUILD_DATE,
    ),

    dir(
      "resume",
      "/resume",
      [
        file(
          "education.txt",
          [
            EDUCATION.school,
            `${EDUCATION.degree}`,
            `${EDUCATION.location} · graduating ${EDUCATION.graduation}`,
            "",
            "coursework",
            ...EDUCATION.coursework.map((c) => `  ${c}`),
          ].join("\n"),
          BUILD_DATE,
        ),
        dir("experience", "/resume/experience", EXPERIENCE.map(roleFile), BUILD_DATE),
        file(
          "skills.txt",
          SKILLS.map(([group, items]) => [group, ...items.map((i) => `  ${i}`)].join("\n")).join("\n\n"),
          BUILD_DATE,
        ),
        file("awards.txt", EDUCATION.awards.join("\n"), BUILD_DATE),
        link("resume.pdf", "Open the PDF ->", "/resume.pdf", BUILD_DATE),
      ],
      BUILD_DATE,
    ),

    dir("projects", "/projects", projectNodes, BUILD_DATE),

    dir(
      "contact",
      "/contact",
      [
        {
          name: "send-message",
          kind: "file",
          action: "compose",
          size: 0,
          modified: BUILD_DATE,
        },
        link("email.txt", LINKS.email, `mailto:${LINKS.email}`, BUILD_DATE),
      ],
      BUILD_DATE,
    ),
  ];
}
