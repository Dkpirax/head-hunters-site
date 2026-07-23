CREATE TABLE `KnowledgeChunk` (
	`id` varchar(191) NOT NULL,
	`documentId` varchar(191) NOT NULL,
	`documentVersion` varchar(191) NOT NULL,
	`sectionTitle` varchar(191),
	`pageNumber` int,
	`chunkIndex` int NOT NULL,
	`contentHash` varchar(191) NOT NULL,
	`tokenCount` int NOT NULL,
	`vectorRecordId` varchar(191) NOT NULL,
	`status` varchar(191) NOT NULL DEFAULT 'ACTIVE',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `KnowledgeChunk_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `KnowledgeDocument` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`fileName` varchar(191) NOT NULL,
	`version` varchar(191) NOT NULL,
	`status` varchar(191) NOT NULL,
	`checksum` varchar(191) NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`uploadedBy` varchar(191),
	`indexedAt` timestamp,
	CONSTRAINT `KnowledgeDocument_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `Job` ADD `mode` varchar(191);--> statement-breakpoint
ALTER TABLE `Job` ADD `chatStatus` varchar(191);--> statement-breakpoint
ALTER TABLE `Job` ADD `assignedAdminId` varchar(191);--> statement-breakpoint
ALTER TABLE `Job` ADD `aiModel` varchar(191);--> statement-breakpoint
ALTER TABLE `Job` ADD `knowledgeDocumentVersion` varchar(191);--> statement-breakpoint
ALTER TABLE `Job` ADD `lastRetrievalScore` float;--> statement-breakpoint
ALTER TABLE `Job` ADD `handoffReason` text;--> statement-breakpoint
ALTER TABLE `Message` ADD `sender` varchar(191);--> statement-breakpoint
ALTER TABLE `Message` ADD `grounded` boolean;--> statement-breakpoint
ALTER TABLE `Message` ADD `retrievedChunkIds` text;--> statement-breakpoint
ALTER TABLE `Message` ADD `modelName` varchar(191);--> statement-breakpoint
ALTER TABLE `Message` ADD `latencyMs` int;--> statement-breakpoint
ALTER TABLE `Message` ADD `errorCode` varchar(191);--> statement-breakpoint
CREATE INDEX `knowledge_chunk_document_id_idx` ON `KnowledgeChunk` (`documentId`);--> statement-breakpoint
CREATE INDEX `knowledge_chunk_vector_record_id_idx` ON `KnowledgeChunk` (`vectorRecordId`);