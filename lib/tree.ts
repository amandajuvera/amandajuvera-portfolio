import { db } from "./db";

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

function dir(name: string, path: string, children: Node[], modified: string): Node {
  return { name, kind: "dir", size: children.length, modified, path, children };
}

const BUILD_DATE = "2026-08-24";

/**
 * The site as a filesystem. Project entries come from the database, and their
 * timestamps are the real `pushed_at` values cached by the GitHub sync — so the
 * listing ages on its own rather than showing invented dates.
 */
export async function buildTree(): Promise<Node[]> {
  const projects = await db.project.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const projectNodes: Node[] = projects.map((p) => {
    const stamp = (p.ghPushedAt ?? p.updatedAt).toISOString().slice(0, 10);
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
            [file("README.txt", `${title!.trim()}\n\n${bodyText!.trim()}`, stamp)],
            stamp,
          ),
        )
      : [file("README.txt", p.description, stamp)];

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

    if (p.repoUrl) children.push(file("source.url", p.repoUrl, stamp));

    return dir(p.slug, `/projects/${p.slug}`, children, stamp);
  });

  return [
    dir(
      "about",
      "/about",
      [
        file(
          "bio.txt",
          [
            "Hey, I'm Amanda. I am a senior at the University of Michigan",
            "studying Computer Science (B.S.).",
            "",
            "I have lived in California, New Jersey, Texas, Georgia, and Arizona.",
            "I have experience in software engineering at Oracle Cloud Infrastructure.",
            "I am passionate about building software with a user-centric mindset.",
          ].join("\n"),
          BUILD_DATE,
        ),
        file(
          "interests.txt",
          ["read", "draw", "weight-lift", "hike", "travel"].join("\n"),
          BUILD_DATE,
        ),
        file("location.txt", "Ann Arbor, Michigan", BUILD_DATE),
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
            "B.S. Computer Science          Aug 2023 - May 2027",
            "University of Michigan, Ann Arbor, MI",
            "",
            "Blue Ribbon Undergraduate Research Award; University Honors",
            "Coursework: Operating Systems, Advanced OS Projects,",
            "Data Structures and Algorithms, Machine Learning, Web Systems",
          ].join("\n"),
          BUILD_DATE,
        ),
        file(
          "experience.txt",
          [
            "Software Engineer Intern       May 2026 - Aug 2026",
            "Oracle, Santa Clara, CA",
            "",
            "Software Engineer Intern       May 2025 - Aug 2025",
            "Retrospect, Ann Arbor, MI",
            "",
            "Computer Science Mentor        Aug 2024 - Present",
            "University of Michigan CSE",
            "",
            "Research Assistant             Oct 2023 - Apr 2024",
            "University of Michigan, Maldonado Lab",
          ].join("\n"),
          BUILD_DATE,
        ),
        file(
          "skills.txt",
          [
            "languages   Python, C++, C, Java, TypeScript",
            "web         React, Next.js, Node.js, REST APIs, CI/CD",
            "systems     Linux, multithreading, POSIX threads & sockets,",
            "            virtual memory, Git, GDB, LLDB, OCI",
          ].join("\n"),
          BUILD_DATE,
        ),
        file("resume.pdf", "/resume.pdf", BUILD_DATE),
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
        file("email.txt", "ajuvera@umich.edu", BUILD_DATE),
      ],
      BUILD_DATE,
    ),
  ];
}
