CREATE TABLE "AdminUser" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"email" varchar(191) NOT NULL,
	"passwordHash" varchar(191) NOT NULL,
	"name" varchar(191),
	"role" varchar(191) DEFAULT 'ADMIN' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AdminUser_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Article" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"title" varchar(191) NOT NULL,
	"slug" varchar(191) NOT NULL,
	"category" varchar(191) NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Candidate" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"email" varchar(191) NOT NULL,
	"name" varchar(191),
	"dateOfBirth" timestamp NOT NULL,
	"parentalConsent" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Candidate_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Content" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"key" varchar(191) NOT NULL,
	"value" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Content_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "Conversation" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"userId" varchar(191) NOT NULL,
	"status" varchar(191) NOT NULL,
	"takenBy" varchar(191),
	"needsHuman" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Employer" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"email" varchar(191) NOT NULL,
	"name" varchar(191),
	"dateOfBirth" timestamp NOT NULL,
	"parentalConsent" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Employer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Enquiry" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"email" varchar(191) NOT NULL,
	"phone" varchar(191),
	"type" varchar(191) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(191) DEFAULT 'NEW' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Job" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"title" varchar(191) NOT NULL,
	"location" varchar(191) NOT NULL,
	"type" varchar(191) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(191) DEFAULT 'ACTIVE' NOT NULL,
	"isHot" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Message" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"conversationId" varchar(191) NOT NULL,
	"senderType" varchar(191) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"isReadByAdmin" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PasswordResetToken" (
	"token" varchar(191) PRIMARY KEY NOT NULL,
	"email" varchar(191) NOT NULL,
	"expires" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Permission" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"description" varchar(191),
	CONSTRAINT "Permission_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "UserPermission" (
	"userId" varchar(191) NOT NULL,
	"permissionId" varchar(191) NOT NULL,
	CONSTRAINT "UserPermission_userId_permissionId_pk" PRIMARY KEY("userId","permissionId")
);
--> statement-breakpoint
CREATE INDEX "admin_user_email_idx" ON "AdminUser" USING btree ("email");--> statement-breakpoint
CREATE INDEX "candidate_email_idx" ON "Candidate" USING btree ("email");--> statement-breakpoint
CREATE INDEX "conversation_status_idx" ON "Conversation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversation_user_id_idx" ON "Conversation" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "employer_email_idx" ON "Employer" USING btree ("email");--> statement-breakpoint
CREATE INDEX "enquiry_status_idx" ON "Enquiry" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enquiry_email_idx" ON "Enquiry" USING btree ("email");--> statement-breakpoint
CREATE INDEX "job_status_idx" ON "Job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_created_at_idx" ON "Job" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "message_conversation_id_idx" ON "Message" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "user_permission_user_id_idx" ON "UserPermission" USING btree ("userId");