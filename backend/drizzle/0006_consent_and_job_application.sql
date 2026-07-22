ALTER TABLE `Candidate` ADD COLUMN `consentAccepted` tinyint(1) NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `Candidate` ADD COLUMN `consentTimestamp` timestamp NULL;--> statement-breakpoint
ALTER TABLE `Candidate` ADD COLUMN `privacyPolicyVersion` varchar(50) DEFAULT '1.0';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `JobApplication` (
  `id` varchar(191) NOT NULL,
  `candidateId` varchar(191) NOT NULL,
  `jobId` varchar(191) NOT NULL,
  `applicationStatus` varchar(191) NOT NULL DEFAULT 'SUBMITTED',
  `source` varchar(191) NOT NULL DEFAULT 'AI_CHAT',
  `conversationId` varchar(191) NULL,
  `appliedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_application_candidate_id_idx` (`candidateId`),
  KEY `job_application_job_id_idx` (`jobId`)
);
