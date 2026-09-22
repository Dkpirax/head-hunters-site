# Database Slug Backfill & Data Migration Guide

**Context:** Following migration `0001_seo_job_fields.sql`, existing vacancy rows in the `Job` table will have `slug = NULL`. While the backend dynamically computes a fallback slug for incoming requests to prevent broken links, running a permanent backfill ensures all records have unique, clean slugs stored directly in MySQL.

---

## 1. Slug Generation Standard

A slug is generated using the formula:
```
toSlug(title) + '-' + id.slice(-6)
```
For example:
* **Job Title:** Senior Finance Manager
* **Job ID:** `8bc75493-f8e8-4cb1-a0a3-b9817d48edcc`
* **Generated Slug:** `senior-finance-manager-48edcc`

Appending the last 6 characters of the UUID guarantees uniqueness across jobs with identical titles without relying on collision-retry loops.

---

## 2. Automated Node.js Backfill Script

A utility script can be executed against the database using the existing backend environment:

```typescript
// scripts/backfill-slugs.ts
import { db } from '../backend/src/db';
import { job } from '../backend/src/db/schema';
import { isNull, eq } from 'drizzle-orm';

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function runBackfill() {
  console.log('Fetching jobs without slugs...');
  const unbackfilledJobs = await db.select().from(job).where(isNull(job.slug));

  console.log(`Found ${unbackfilledJobs.length} jobs to update.`);

  for (const j of unbackfilledJobs) {
    const slugSuffix = j.id.slice(-6);
    const generatedSlug = `${toSlug(j.title)}-${slugSuffix}`;

    await db
      .update(job)
      .set({ slug: generatedSlug })
      .where(eq(job.id, j.id));

    console.log(`Updated Job [${j.id}] -> slug: "${generatedSlug}"`);
  }

  console.log('Slug backfill complete.');
}

runBackfill().catch(console.error);
```

---

## 3. Direct SQL Backfill Alternative

If running directly in MySQL CLI or phpMyAdmin without Node.js:

```sql
-- Generate slug using lowercased title and last 6 chars of id
UPDATE `Job`
SET `slug` = CONCAT(
  LOWER(REGEXP_REPLACE(TRIM(`title`), '[^a-zA-Z0-9]+', '-')),
  '-',
  RIGHT(`id`, 6)
)
WHERE `slug` IS NULL;

-- Verification
SELECT `id`, `title`, `slug` FROM `Job` LIMIT 10;
```

---

## 4. Rollback / Cleanup

If you need to reset all slugs:
```sql
UPDATE `Job` SET `slug` = NULL;
```
