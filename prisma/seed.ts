import { PrismaClient } from "@prisma/client";
import { PROJECTS } from "../lib/resume";

const db = new PrismaClient();

/**
 * Loads the checked-in resume projects into the CMS. `update: {}` on purpose —
 * re-seeding must not clobber edits made from /admin.
 */
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
