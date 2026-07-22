ALTER TABLE `Candidate` ADD COLUMN `whatsapp` varchar(191) NULL;--> statement-breakpoint
ALTER TABLE `Candidate` ADD COLUMN `location` varchar(191) NULL;--> statement-breakpoint
ALTER TABLE `Candidate` ADD COLUMN `status` varchar(191) DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE `Candidate` ADD COLUMN `source` varchar(191) DEFAULT 'WEBSITE';--> statement-breakpoint
ALTER TABLE `Candidate` ADD COLUMN `originalCvFileName` varchar(191) NULL;--> statement-breakpoint
CREATE INDEX `candidate_phone_idx` ON `Candidate` (`phone`);
