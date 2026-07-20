import { mysqlTable, varchar, text, boolean, timestamp, datetime, primaryKey, index, int, float } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import crypto from 'crypto';

const utcTimestamp = (name: string) => timestamp(name, { mode: 'date' });
const utcDateTime = (name: string) => datetime(name, { mode: 'date' });

export const job = mysqlTable('Job', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 191 }).notNull(),
  location: varchar('location', { length: 191 }).notNull(),
  type: varchar('type', { length: 191 }).notNull(), // CASUAL, PERMANENT, REMOTE, EXECUTIVE
  description: text('description').notNull(),
  status: varchar('status', { length: 191 }).notNull().default('ACTIVE'), // ACTIVE, CLOSED, DRAFT
  isHot: boolean('isHot').notNull().default(false),
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
  updatedAt: utcTimestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),

}, (table) => {
  return {
    statusIdx: index('job_status_idx').on(table.status),
    createdAtIdx: index('job_created_at_idx').on(table.createdAt),
  };
});

export const enquiry = mysqlTable('Enquiry', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 191 }).notNull(),
  email: varchar('email', { length: 191 }).notNull(),
  phone: varchar('phone', { length: 191 }),
  type: varchar('type', { length: 191 }).notNull(), // HIRING, CANDIDATE, GENERAL
  message: text('message').notNull(),
  status: varchar('status', { length: 191 }).notNull().default('NEW'), // NEW, READ, ASSIGNED, ARCHIVED
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
  updatedAt: utcTimestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
  return {
    statusIdx: index('enquiry_status_idx').on(table.status),
    emailIdx: index('enquiry_email_idx').on(table.email),
  };
});

export const content = mysqlTable('Content', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: varchar('key', { length: 191 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: utcTimestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const article = mysqlTable('Article', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 191 }).notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  category: varchar('category', { length: 191 }).notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  isPublished: boolean('isPublished').notNull().default(false),
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
  updatedAt: utcTimestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
});


export const knowledgeDocument = mysqlTable('KnowledgeDocument', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 191 }).notNull(),
  fileName: varchar('fileName', { length: 191 }).notNull(),
  version: varchar('version', { length: 191 }).notNull(),
  status: varchar('status', { length: 191 }).notNull(), // DRAFT, PROCESSING, INDEXED, APPROVED, INACTIVE, FAILED
  checksum: varchar('checksum', { length: 191 }).notNull(),
  uploadedAt: utcTimestamp('uploadedAt').notNull().defaultNow(),
  uploadedBy: varchar('uploadedBy', { length: 191 }),
  indexedAt: utcTimestamp('indexedAt'),
});

export const knowledgeChunk = mysqlTable('KnowledgeChunk', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  documentId: varchar('documentId', { length: 191 }).notNull(),
  documentVersion: varchar('documentVersion', { length: 191 }).notNull(),
  sectionTitle: varchar('sectionTitle', { length: 191 }),
  pageNumber: int('pageNumber'),
  chunkIndex: int('chunkIndex').notNull(),
  contentHash: varchar('contentHash', { length: 191 }).notNull(),
  tokenCount: int('tokenCount').notNull(),
  vectorRecordId: varchar('vectorRecordId', { length: 191 }).notNull(),
  status: varchar('status', { length: 191 }).notNull().default('ACTIVE'),
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
}, (table) => {
  return {
    documentIdIdx: index('knowledge_chunk_document_id_idx').on(table.documentId),
    vectorRecordIdIdx: index('knowledge_chunk_vector_record_id_idx').on(table.vectorRecordId),
  };
});

export const conversation = mysqlTable('Conversation', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('userId', { length: 191 }).notNull(),
  status: varchar('status', { length: 191 }).notNull(), // BOT_ACTIVE, HUMAN_ACTIVE, CLOSED
  takenBy: varchar('takenBy', { length: 191 }),
  needsHuman: boolean('needsHuman').notNull().default(false),
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
  updatedAt: utcTimestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
  mode: varchar('mode', { length: 191 }), // AI, HUMAN, CLOSED
  chatStatus: varchar('chatStatus', { length: 191 }), // OPEN, WAITING_FOR_ADMIN, RESOLVED
  assignedAdminId: varchar('assignedAdminId', { length: 191 }),
  aiModel: varchar('aiModel', { length: 191 }),
  knowledgeDocumentVersion: varchar('knowledgeDocumentVersion', { length: 191 }),
  lastRetrievalScore: float('lastRetrievalScore'),
  handoffReason: text('handoffReason'),
  humanSupportProvider: varchar('humanSupportProvider', { length: 191 }).default('INTERNAL'),
  handoffRequestedAt: utcTimestamp('handoffRequestedAt'),
  tawkOpenedAt: utcTimestamp('tawkOpenedAt'),
  agentJoinedAt: utcTimestamp('agentJoinedAt'),
  handoffCompletedAt: utcTimestamp('handoffCompletedAt'),
  handoffFailureReason: text('handoffFailureReason'),
}, (table) => {
  return {
    statusIdx: index('conversation_status_idx').on(table.status),
    userIdIdx: index('conversation_user_id_idx').on(table.userId),
  };
});

export const message = mysqlTable('Message', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: varchar('conversationId', { length: 191 }).notNull(),
  senderType: varchar('senderType', { length: 191 }).notNull(), // USER, ADMIN, BOT
  content: text('content').notNull(),
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
  isReadByAdmin: boolean('isReadByAdmin').notNull().default(false),
  sender: varchar('sender', { length: 191 }), // USER, AI, ADMIN, SYSTEM
  grounded: boolean('grounded'),
  retrievedChunkIds: text('retrievedChunkIds'),
  modelName: varchar('modelName', { length: 191 }),
  latencyMs: int('latencyMs'),
  errorCode: varchar('errorCode', { length: 191 }),
}, (table) => {
  return {
    conversationIdIdx: index('message_conversation_id_idx').on(table.conversationId),
    createdAtIdx: index('message_created_at_idx').on(table.createdAt),
    senderTypeIdx: index('message_sender_type_idx').on(table.senderType),
  };
});

export const adminUser = mysqlTable('AdminUser', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 191 }).notNull().unique(),
  passwordHash: varchar('passwordHash', { length: 191 }).notNull(),
  name: varchar('name', { length: 191 }),
  role: varchar('role', { length: 191 }).notNull().default('ADMIN'), // SUPER_ADMIN, ADMIN, USER
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
  updatedAt: utcTimestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
  return {
    emailIdx: index('admin_user_email_idx').on(table.email),
  };
});

export const candidate = mysqlTable('Candidate', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 191 }).notNull().unique(),
  name: varchar('name', { length: 191 }),
  phone: varchar('phone', { length: 191 }),
  interestedJobs: text('interestedJobs'),
  cvFileName: varchar('cvFileName', { length: 191 }),
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
  updatedAt: utcTimestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
  return {
    emailIdx: index('candidate_email_idx').on(table.email),
  };
});

export const employer = mysqlTable('Employer', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 191 }).notNull().unique(),
  name: varchar('name', { length: 191 }),
  dateOfBirth: utcDateTime('dateOfBirth').notNull(),
  parentalConsent: boolean('parentalConsent').notNull().default(false),
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
  updatedAt: utcTimestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
  return {
    emailIdx: index('employer_email_idx').on(table.email),
  };
});

export const permission = mysqlTable('Permission', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 191 }).notNull().unique(),
  description: varchar('description', { length: 191 }),
});

export const userPermission = mysqlTable('UserPermission', {
  userId: varchar('userId', { length: 191 }).notNull(),
  permissionId: varchar('permissionId', { length: 191 }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.permissionId] }),
    userIdIdx: index('user_permission_user_id_idx').on(table.userId),
  };
});

export const passwordResetToken = mysqlTable('PasswordResetToken', {
  token: varchar('token', { length: 191 }).primaryKey(),
  email: varchar('email', { length: 191 }).notNull(),
  expires: utcDateTime('expires').notNull(),
  createdAt: utcTimestamp('createdAt').notNull().defaultNow(),
});

// Relations
export const conversationRelations = relations(conversation, ({ many }) => ({
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
}));

export const adminUserRelations = relations(adminUser, ({ many }) => ({
  permissions: many(userPermission),
}));

export const permissionRelations = relations(permission, ({ many }) => ({
  userPermissions: many(userPermission),
}));

export const userPermissionRelations = relations(userPermission, ({ one }) => ({
  user: one(adminUser, {
    fields: [userPermission.userId],
    references: [adminUser.id],
  }),
  permission: one(permission, {
    fields: [userPermission.permissionId],
    references: [permission.id],
  }),
}));
