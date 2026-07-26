ALTER TABLE `Conversation` ADD COLUMN `workflowType` varchar(50) DEFAULT 'NONE';--> statement-breakpoint
ALTER TABLE `Conversation` ADD COLUMN `workflowState` varchar(100) DEFAULT 'IDLE';--> statement-breakpoint
ALTER TABLE `Conversation` ADD COLUMN `workflowData` text;--> statement-breakpoint
ALTER TABLE `Conversation` ADD COLUMN `workflowUpdatedAt` timestamp;
