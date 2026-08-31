/**
 * The resume, as data.
 *
 * Everything the site says about Amanda lives here so the filesystem tree and
 * the database seed can't drift apart. `lib/tree.ts` renders it as directories
 * and files; `prisma/seed.ts` loads PROJECTS into the CMS.
 */

export type Role = {
  slug: string;
  title: string;
  org: string;
  location: string;
  dates: string;
  bullets: string[];
};

export type ProjectSeed = {
  slug: string;
  title: string;
  techLine: string;
  /**
   * Blank-line separated paragraphs. When every paragraph reads
   * "Component — detail" the tree splits them into sibling directories, so a
   * project holding several distinct pieces browses as several projects.
   */
  description: string;
  repoUrl: string | null;
  liveUrl?: string | null;
  sortOrder: number;
};

export const LINKS = {
  email: "ajuvera@umich.edu",
  linkedin: "https://linkedin.com/in/amandajuvera",
  github: "https://github.com/amandajuvera",
};

export const EDUCATION = {
  school: "University of Michigan",
  degree: "Bachelor of Science in Computer Science",
  location: "Ann Arbor, MI",
  graduation: "May 2027",
  coursework: [
    "Distributed Systems",
    "Operating Systems",
    "Advanced Operating Systems",
    "Data Structures and Algorithms",
    "Machine Learning",
    "Computer Organization",
    "Object Oriented Programming",
  ],
  awards: [
    "Blue Ribbon Undergraduate Research Award",
    "University Honors",
    "LSA Scholarship Recipient",
  ],
};

export const EXPERIENCE: Role[] = [
  {
    slug: "oracle",
    title: "Software Engineer Intern",
    org: "Oracle",
    location: "Santa Clara, CA",
    dates: "May 2026 - Aug 2026",
    bullets: [
      "Redesigned SBOM generation in Syft (open-source Go library) to preserve package ownership context across teams, eliminating 100% of false-positive vulnerability audits for SmartNIC artifacts and surfacing 1,000+ undetected vulnerabilities.",
      "Shipped a custom build service configuration that scaled security scanning from a single team to every Oracle Cloud Infrastructure (OCI) artifact, extending coverage org-wide with no added operator workload.",
    ],
  },
  {
    slug: "bananza",
    title: "Software Engineer",
    org: "Bananza Marketing Agency",
    location: "Prague, Czech Republic",
    dates: "Jan 2026 - May 2026",
    bullets: [
      "Shipped a nightly Python pipeline consolidating performance metrics for 50+ clients into a centralized workspace, cutting 5+ hours per week of manual data entry.",
      "Modeled client records as structured databases over paginated REST APIs with schema mapping and rate-limit handling, letting non-technical strategists build client-facing reports without engineering support.",
      "Deployed on GitHub Actions with encrypted secrets and dual cron schedules, eliminating all manual runs.",
    ],
  },
  {
    slug: "retrospect",
    title: "Software Engineer Intern",
    org: "Retrospect",
    location: "Ann Arbor, MI",
    dates: "May 2025 - Aug 2025",
    bullets: [
      "Built a computer vision pipeline using HSV filtering and region-of-interest cropping to classify traffic light state from low-quality video at 90% accuracy, reclaiming 10+ hours per week for safety reviewers.",
      "Integrated traffic light detection end-to-end into RiskEngine, a production tool evaluating autonomous vehicle safety across large volumes of recorded drive data.",
    ],
  },
  {
    slug: "cse-mentor",
    title: "Computer Science Mentor",
    org: "University of Michigan, Computer Science and Engineering",
    location: "Ann Arbor, MI",
    dates: "Aug 2024 - Present",
    bullets: [
      "Mentored students across four semesters in data structures, memory management, concurrency, and C++ debugging, giving and receiving rapid feedback under deadline.",
    ],
  },
  {
    slug: "maldonado-lab",
    title: "Research Assistant",
    org: "University of Michigan, Maldonado Lab",
    location: "Ann Arbor, MI",
    dates: "Oct 2023 - Apr 2024",
    bullets: [
      "Built LabVIEW automation software for Scanning Electrochemical Probe Microscopy, cutting experiment runtime by 50% and removing manual instrument operation from the research workflow.",
    ],
  },
];

export const SKILLS: [string, string[]][] = [
  [
    "languages",
    ["TypeScript", "JavaScript", "Python", "C++", "C", "Java", "Swift", "SQL", "Go"],
  ],
  [
    "frameworks",
    ["React", "Next.js", "Node.js", "Prisma", "Zod", "PostgreSQL"],
  ],
  [
    "tools",
    [
      "Git",
      "GitHub Actions",
      "Linux",
      "Vercel",
      "REST APIs",
      "AI coding tools (Claude Code, Codex)",
    ],
  ],
];

export const PROJECTS: ProjectSeed[] = [
  {
    slug: "personal-website-cms",
    title: "Personal Website & CMS",
    techLine: "TypeScript, Next.js, React, Node.js, PostgreSQL, Prisma, Zod, Vercel",
    description:
      "This site. A full-stack portfolio and CMS in Next.js 16 and React 19 over PostgreSQL and Prisma, with an OAuth-gated admin dashboard and a Canvas-animated interface that models the site as a browsable filesystem.\n\nThe public API is hardened with Zod schema validation and salted-hash IP rate limiting, and a nightly cron job syncs repository metadata from the GitHub REST API so the listing ages on its own.",
    repoUrl: "https://github.com/amandajuvera/amandajuvera-portfolio",
    liveUrl: "https://amandajuvera-portfolio.vercel.app",
    sortOrder: 10,
  },
  {
    slug: "navi",
    title: "Navi, Road Trip Navigation",
    techLine: "Swift, JavaScript, Python, MapKit, Cloudflare Workers",
    description:
      'In progress. An "on the way" stop search that ranks candidates by the travel time they add to the route corridor rather than straight-line distance, so a nearby stop that costs a long detour ranks below a further one that barely costs anything.\n\nA refueling scheduler over tank capacity, fuel efficiency, and crowd-sourced gas prices, minimizing total trip fuel cost with selectable strategies for fewest stops versus lowest spend.',
    repoUrl: "https://github.com/amandajuvera/navi",
    sortOrder: 20,
  },
  {
    slug: "operating-systems-components",
    title: "Operating Systems Components",
    techLine: "C++, POSIX, TCP",
    description:
      "Network file server — a concurrent, crash-consistent file server over TCP sockets, using fine-grained reader-writer locking with hand-over-hand traversal and ordered disk writes to hold metadata invariants across a crash.\n\nVirtual memory manager — a demand-paged system with swap- and file-backed pages, copy-on-write fork(), and clock page replacement, minimizing disk I/O on page faults.\n\nThread library — a kernel-level library with ucontext switching, mutexes, condition variables, and interrupt-safe synchronization, enabling preemptive multitasking across multiple CPUs.",
    repoUrl: null,
    sortOrder: 30,
  },
];
