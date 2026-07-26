ALTER TABLE `Conversation` ADD `mode` varchar(191);--> statement-breakpoint
ALTER TABLE `Conversation` ADD `chatStatus` varchar(191);--> statement-breakpoint
ALTER TABLE `Conversation` ADD `assignedAdminId` varchar(191);--> statement-breakpoint
ALTER TABLE `Conversation` ADD `aiModel` varchar(191);--> statement-breakpoint
ALTER TABLE `Conversation` ADD `knowledgeDocumentVersion` varchar(191);--> statement-breakpoint
ALTER TABLE `Conversation` ADD `lastRetrievalScore` float;--> statement-breakpoint
ALTER TABLE `Conversation` ADD `handoffReason` text;