CREATE TABLE `AdminUser` (
	`id` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`passwordHash` varchar(191) NOT NULL,
	`name` varchar(191),
	`role` varchar(191) NOT NULL DEFAULT 'ADMIN',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `AdminUser_id` PRIMARY KEY(`id`),
	CONSTRAINT `AdminUser_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `Article` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`category` varchar(191) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `Article_id` PRIMARY KEY(`id`),
	CONSTRAINT `Article_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `Candidate` (
	`id` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(191),
	`dateOfBirth` datetime NOT NULL,
	`parentalConsent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `Candidate_id` PRIMARY KEY(`id`),
	CONSTRAINT `Candidate_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `Content` (
	`id` varchar(191) NOT NULL,
	`key` varchar(191) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `Content_id` PRIMARY KEY(`id`),
	CONSTRAINT `Content_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `Conversation` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`status` varchar(191) NOT NULL,
	`takenBy` varchar(191),
	`needsHuman` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `Conversation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Employer` (
	`id` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(191),
	`dateOfBirth` datetime NOT NULL,
	`parentalConsent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `Employer_id` PRIMARY KEY(`id`),
	CONSTRAINT `Employer_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `Enquiry` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`phone` varchar(191),
	`type` varchar(191) NOT NULL,
	`message` text NOT NULL,
	`status` varchar(191) NOT NULL DEFAULT 'NEW',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `Enquiry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Job` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`location` varchar(191) NOT NULL,
	`type` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`status` varchar(191) NOT NULL DEFAULT 'ACTIVE',
	`isHot` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `Job_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Message` (
	`id` varchar(191) NOT NULL,
	`conversationId` varchar(191) NOT NULL,
	`senderType` varchar(191) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`isReadByAdmin` boolean NOT NULL DEFAULT false,
	CONSTRAINT `Message_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `PasswordResetToken` (
	`token` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`expires` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `PasswordResetToken_token` PRIMARY KEY(`token`)
);
--> statement-breakpoint
CREATE TABLE `Permission` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` varchar(191),
	CONSTRAINT `Permission_id` PRIMARY KEY(`id`),
	CONSTRAINT `Permission_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `UserPermission` (
	`userId` varchar(191) NOT NULL,
	`permissionId` varchar(191) NOT NULL,
	CONSTRAINT `UserPermission_userId_permissionId_pk` PRIMARY KEY(`userId`,`permissionId`)
);
--> statement-breakpoint
CREATE INDEX `admin_user_email_idx` ON `AdminUser` (`email`);--> statement-breakpoint
CREATE INDEX `candidate_email_idx` ON `Candidate` (`email`);--> statement-breakpoint
CREATE INDEX `conversation_status_idx` ON `Conversation` (`status`);--> statement-breakpoint
CREATE INDEX `conversation_user_id_idx` ON `Conversation` (`userId`);--> statement-breakpoint
CREATE INDEX `employer_email_idx` ON `Employer` (`email`);--> statement-breakpoint
CREATE INDEX `enquiry_status_idx` ON `Enquiry` (`status`);--> statement-breakpoint
CREATE INDEX `enquiry_email_idx` ON `Enquiry` (`email`);--> statement-breakpoint
CREATE INDEX `job_status_idx` ON `Job` (`status`);--> statement-breakpoint
CREATE INDEX `job_created_at_idx` ON `Job` (`createdAt`);--> statement-breakpoint
CREATE INDEX `message_conversation_id_idx` ON `Message` (`conversationId`);--> statement-breakpoint
CREATE INDEX `message_created_at_idx` ON `Message` (`createdAt`);--> statement-breakpoint
CREATE INDEX `message_sender_type_idx` ON `Message` (`senderType`);--> statement-breakpoint
CREATE INDEX `user_permission_user_id_idx` ON `UserPermission` (`userId`);