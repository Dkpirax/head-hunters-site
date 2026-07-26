ALTER TABLE `Candidate` ADD COLUMN `phoneNormalized` varchar(191) NULL;--> statement-breakpoint
ALTER TABLE `Candidate` ADD COLUMN `whatsappNormalized` varchar(191) NULL;--> statement-breakpoint
ALTER TABLE `Candidate` ADD COLUMN `consentConversationId` varchar(191) NULL;--> statement-breakpoint
CREATE INDEX `candidate_phone_normalized_idx` ON `Candidate` (`phoneNormalized`);--> statement-breakpoint
CREATE INDEX `candidate_whatsapp_idx` ON `Candidate` (`whatsapp`);--> statement-breakpoint
CREATE INDEX `candidate_whatsapp_normalized_idx` ON `Candidate` (`whatsappNormalized`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `CandidateConsent` (
  `id` varchar(191) NOT NULL PRIMARY KEY,
  `candidateId` varchar(191) NOT NULL,
  `conversationId` varchar(191) NULL,
  `privacyPolicyVersion` varchar(50) NOT NULL DEFAULT '1.0',
  `consentType` varchar(100) NOT NULL DEFAULT 'CANDIDATE_PROFILE_AND_CV',
  `accepted` tinyint(1) NOT NULL DEFAULT 1,
  `acceptedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(50) NOT NULL DEFAULT 'AI_CHAT',
  KEY `candidate_consent_candidate_idx` (`candidateId`)
);--> statement-breakpoint
ALTER TABLE `JobApplication` ADD UNIQUE KEY `job_application_candidate_job_unique` (`candidateId`, `jobId`);
