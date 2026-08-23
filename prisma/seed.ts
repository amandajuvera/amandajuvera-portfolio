import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PROJECTS = [
  {
    slug: "social-media-analytics-pipeline",
    title: "Social Media Analytics Pipeline",
    techLine: "Python, Notion API, GitHub Actions, LiveDune API",
    description:
      "A nightly automation that ingests third-party marketing data into a client's Notion workspace, modeling records as Notion databases and handling API pagination, schema mapping, and rate limits.\n\nRuns unattended on dual cron schedules with encrypted secrets, which saved a social media company more than five hours a week of manual reporting.",
    repoUrl: null,
    sortOrder: 10,
  },
  {
    slug: "operating-system-components",
    title: "Operating System Components",
    techLine: "C++",
    description:
      "Network file server — a concurrent, crash-consistent server over TCP sockets, using fine-grained reader-writer locking with hand-over-hand traversal and ordered disk writes to preserve metadata invariants.\n\nVirtual memory manager — a demand-paged system with swap- and file-backed pages, copy-on-write fork(), and clock page replacement to minimize disk I/O.\n\nThread library — preemptive kernel-level threading across multiple CPUs with ucontext switching, mutexes, condition variables, and interrupt-safe synchronization.",
    repoUrl: null,
    sortOrder: 20,
  },
  {
    slug: "personal-portfolio-website",
    title: "Personal Portfolio Website",
    techLine: "Next.js, TypeScript, PostgreSQL, Prisma, NextAuth",
    description:
      "This site — a full-stack portfolio with a database-backed projects section, an authenticated admin dashboard for editing content, and a rate-limited contact form that stores messages server-side.\n\nA scheduled job syncs live repository stats from the GitHub API, so project cards stay current without redeploying.",
    repoUrl: "https://github.com/amandajuvera/amandajuvera.github.io",
    sortOrder: 30,
  },
];

async function main() {
  for (const project of PROJECTS) {
    await db.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    });
  }
  console.log(`Seeded ${PROJECTS.length} projects.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
