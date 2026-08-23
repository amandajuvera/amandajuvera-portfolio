import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Resume — Amanda Juvera" };

type Entry = {
  role: string;
  dates: string;
  where: string;
  bullets: string[];
};

const EDUCATION: Entry[] = [
  {
    role: "B.S. Computer Science",
    dates: "Aug 2023 — May 2027",
    where: "University of Michigan — Ann Arbor, MI",
    bullets: [
      "Blue Ribbon Undergraduate Research Award; University Honors; LSA Scholarship recipient",
      "Coursework: Operating Systems, Advanced Operating Systems Projects, Data Structures and Algorithms, Machine Learning, Web Systems (in progress)",
    ],
  },
];

const EXPERIENCE: Entry[] = [
  {
    role: "Software Engineer Intern",
    dates: "May 2026 — Aug 2026",
    where: "Oracle — Santa Clara, CA",
    bullets: [
      "Redesigned Syft-based Software Bill of Materials generation for an internal security scanning platform to preserve package ownership context, eliminating all false-positive vulnerability audits for SmartNIC artifacts and surfacing 1,000+ previously missed vulnerabilities.",
      "Engineered a custom build service configuration to scale security scanning across all Oracle Cloud Infrastructure artifacts, extending coverage beyond the Virtual Cloud Networking Card Management team.",
    ],
  },
  {
    role: "Software Engineer Intern",
    dates: "May 2025 — Aug 2025",
    where: "Retrospect — Ann Arbor, MI",
    bullets: [
      "Shipped traffic light detection end-to-end into RiskEngine, an in-vehicle monitoring tool used to assess autonomous vehicle safety.",
      "Built a computer vision pipeline using HSV filtering and ROI cropping to classify traffic light states from low-quality video at 90% accuracy, replacing manual annotation and saving reviewers 10+ hours per week.",
    ],
  },
  {
    role: "Computer Science Mentor",
    dates: "Aug 2024 — Present",
    where:
      "University of Michigan, Computer Science and Engineering — Ann Arbor, MI",
    bullets: [
      "Mentor students in data structures, memory management, debugging, and C++ systems programming, translating dense concepts into explanations that meet each student where they are.",
    ],
  },
  {
    role: "Research Assistant",
    dates: "Oct 2023 — Apr 2024",
    where: "University of Michigan, Maldonado Lab — Ann Arbor, MI",
    bullets: [
      "Built LabVIEW automation software for Scanning Electrochemical Probe Microscopy experiments, cutting manual experiment time by 50%.",
    ],
  },
];

const SKILLS: { heading: string; items: string[] }[] = [
  { heading: "Languages", items: ["Python", "C++", "C", "Java", "TypeScript"] },
  {
    heading: "Web & APIs",
    items: ["React", "Node.js", "REST APIs", "Notion API", "GitHub Actions", "CI/CD"],
  },
  {
    heading: "Systems & Tools",
    items: [
      "Linux",
      "Multithreading",
      "POSIX threads & sockets",
      "Virtual memory",
      "Git",
      "GDB",
      "LLDB",
      "OCI",
      "LabVIEW",
    ],
  },
];

function EntryBlock({ entry }: { entry: Entry }) {
  return (
    <div className="entry">
      <div className="entry__head">
        <div className="entry__title">
          <figure className="entry__logo">Logo</figure>
          <h3 className="entry__role">{entry.role}</h3>
        </div>
        <span className="utility">{entry.dates}</span>
      </div>
      <p className="entry__where">{entry.where}</p>
      <ul>
        {entry.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ResumePage() {
  return (
    <>
      <Masthead current="/resume" label="Resume" />

      <main className="page">
        <p className="page__eyebrow utility">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20l4-1 12-12-3-3L5 16l-1 4z" />
            <path d="M14 6l3 3" />
          </svg>
          Updated August 2026
        </p>

        <h1 className="page__title">Resume</h1>
        <div className="resume-actions">
          <a className="btn" href="/resume.pdf" download>
            Download PDF
          </a>
          <a className="btn btn--ghost" href="mailto:ajuvera@umich.edu">
            Email me
          </a>
        </div>

        <section className="cv-section">
          <h2 className="section-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 9l10-5 10 5-10 5-10-5z" />
              <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
              <path d="M22 9v6" />
            </svg>
            Education
          </h2>
          {EDUCATION.map((e) => (
            <EntryBlock key={e.role} entry={e} />
          ))}
        </section>

        <section className="cv-section">
          <h2 className="section-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="1.5" />
              <path d="M6 9l3 3-3 3" />
              <path d="M11 15h6" />
            </svg>
            Experience
          </h2>
          {EXPERIENCE.map((e) => (
            <EntryBlock key={`${e.role}-${e.dates}`} entry={e} />
          ))}
        </section>

        {SKILLS.map(({ heading, items }) => (
          <section className="cv-section" key={heading}>
            <h2>{heading}</h2>
            <ul className="skills">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <SiteFooter />
    </>
  );
}
