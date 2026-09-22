-- Migration: 0001_seo_job_fields.sql
-- Adds SEO-required columns to the Job table.
-- Run this against the production database BEFORE deploying the new backend code.
-- Safe to run multiple times: uses IF NOT EXISTS / column existence checks.
--
-- Rollback plan: run 0001_seo_job_fields_rollback.sql (see below)
--
-- Backfill note: existing records will have slug = NULL after this migration.
-- Run the slug backfill script (docs/slug-backfill.md) after deploying.

-- Step 1: Add slug column (nullable, unique — NULL values are not counted by UNIQUE)
ALTER TABLE `Job`
  ADD COLUMN IF NOT EXISTS `slug` varchar(255) NULL UNIQUE COMMENT 'SEO-friendly URL slug, e.g. senior-finance-manager-colombo. NULL until backfill runs.';

-- Step 2: Add closingDate (nullable — not all vacancies have a fixed closing date)
ALTER TABLE `Job`
  ADD COLUMN IF NOT EXISTS `closingDate` timestamp NULL COMMENT 'Optional vacancy closing date. Used as validThrough in JobPosting schema. NULL = 60 days from datePosted.';

-- Step 3: Add salaryRange (nullable — only populate when client permits disclosure)
ALTER TABLE `Job`
  ADD COLUMN IF NOT EXISTS `salaryRange` varchar(191) NULL COMMENT 'Optional disclosed salary range, e.g. LKR 150,000 - 200,000 per month.';

-- Step 4: Add isConfidential (NOT NULL with default false — safe for existing rows)
ALTER TABLE `Job`
  ADD COLUMN IF NOT EXISTS `isConfidential` boolean NOT NULL DEFAULT false COMMENT 'If true, hiringOrganization in JobPosting schema is set to Confidential.';

-- Verification query — run after migration to confirm columns exist:
-- SHOW COLUMNS FROM `Job`;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK: 0001_seo_job_fields_rollback.sql
-- Run this to undo the migration if needed.
-- WARNING: This is destructive — slug data will be lost.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- ALTER TABLE `Job` DROP COLUMN IF EXISTS `slug`;
-- ALTER TABLE `Job` DROP COLUMN IF EXISTS `closingDate`;
-- ALTER TABLE `Job` DROP COLUMN IF EXISTS `salaryRange`;
-- ALTER TABLE `Job` DROP COLUMN IF EXISTS `isConfidential`;
